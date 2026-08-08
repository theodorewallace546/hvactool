"""
HVAC Salesman Q&A — backend

Single-file Flask server. Serves the frontend and proxies to GPT-4o-mini:
  - /api/chat          plain-language Q&A, with web_search gated to
                        permit/compliance-flagged questions only (cost control)
  - /api/lookup-sqft    address -> approximate square footage via web_search
                        over public listing sites (no direct scraping)
  - /api/nameplate      nameplate photo -> decoded model/tonnage/age

The OpenAI API key must never reach the browser — that's the whole reason
this is a server instead of a static HTML file (see goal.txt section 5).
"""

import base64
import io
import json
import re
import os
from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
KNOWLEDGE_FILE = BASE_DIR / "knowledge" / "generic_hvac_knowledge.md"
MODEL = "gpt-4o-mini"

load_dotenv(BASE_DIR / "backend" / ".env")

app = Flask(__name__, static_folder=None)

_client = None


def get_client():
    global _client
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    if _client is None:
        _client = OpenAI(api_key=api_key)
    return _client


def compute_age_years(manufacture_date: str):
    """Deterministic age math — never trust an LLM to do date arithmetic
    against "today." The model only reports what's printed on the label;
    this does the actual subtraction.
    """
    if not manufacture_date:
        return None
    m = re.match(r"^(\d{4})(?:-(\d{2}))?$", manufacture_date.strip())
    if not m:
        return None
    year = int(m.group(1))
    month = int(m.group(2)) if m.group(2) else 6  # unknown month -> assume mid-year
    today = date.today()
    age = today.year - year - ((today.month, today.day) < (month, 1))
    return age if age >= 0 else None


def normalize_image_to_jpeg(data_url: str) -> str:
    """Re-encode any uploaded photo as JPEG before it reaches OpenAI.

    OpenAI's vision API only accepts PNG/JPEG/GIF/WebP. iPhones default to
    HEIC, which silently fails there (the model just can't read it). This
    normalizes every upload regardless of source format so that never
    happens.
    """
    header, _, b64data = data_url.partition(",")
    raw = base64.b64decode(b64data)
    image = Image.open(io.BytesIO(raw))
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=90)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def load_knowledge_base() -> str:
    if not KNOWLEDGE_FILE.exists():
        return ""
    return KNOWLEDGE_FILE.read_text()


def parse_structured(text: str):
    """Split a model response into (display_text, parsed_json_dict_or_None).

    Endpoints that need the model to also hand back machine-readable fields
    (sqft, tonnage, age...) ask it to end its answer with a fenced ```json
    block. This pulls that block out for parsing and strips it from the
    text shown to the rep.
    """
    if not text:
        return text, None

    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    display_text = re.sub(r"```json\s*\{.*?\}\s*```", "", text, flags=re.DOTALL).strip()

    if not match:
        return display_text, None

    try:
        return display_text, json.loads(match.group(1))
    except (json.JSONDecodeError, ValueError):
        return display_text, None


PERMIT_KEYWORDS = [
    "permit", "code", "compliance", "inspection", "inspector", "jurisdiction",
    "ordinance", "title 24", "hers", "rebate", "license", "licensed",
    "department", "city require", "county require", "regulation",
    "legal", "law", "epa", "seer2", "energy star",
]


def needs_web_search(message: str) -> bool:
    lowered = message.lower()
    return any(kw in lowered for kw in PERMIT_KEYWORDS)


CHAT_SYSTEM_PROMPT_TEMPLATE = """You are a field assistant for HVAC sales reps. \
A rep may be standing in a driveway or attic talking to a homeowner, so keep \
answers short, direct, and practical — lead with the actionable answer, then \
brief supporting detail if useful.

Answer using the knowledge base below whenever it's relevant. If a question \
is about current local permit requirements, code, licensing, or rebates, use \
the web_search tool to find current information rather than guessing from \
memory — codes and rebate programs change and vary by jurisdiction.

If asked for a sizing recommendation without square footage given, ask for \
the square footage before finalizing a recommendation.

Never invent numbers that aren't in the knowledge base or from a web search \
you actually performed.

--- KNOWLEDGE BASE ---
{knowledge_base}
--- END KNOWLEDGE BASE ---
"""

SQFT_SYSTEM_PROMPT = """You are helping an HVAC sales rep find the square \
footage AND bedroom/bathroom count of a specific property before a home \
visit. Use the web_search tool to search for it — check Zillow, Redfin, \
Realtor.com, or public county assessor records. Prefer county assessor \
records over listing sites for square footage when they disagree, since \
listing sites sometimes round or include non-livable space. Bedroom/\
bathroom counts are fine to take from a listing site directly.

Report what you find in one or two plain sentences, including which source \
it came from. If you cannot find a confident figure for something, say so \
plainly rather than guessing — a wrong number here can lead to a mis-sized \
HVAC recommendation, and the rep will confirm it with the homeowner \
regardless, so an honest "not found" is far more useful than a fabricated \
number. It's fine to be confident about square footage but not bedroom/\
bathroom count, or vice versa — report each independently.

End your response with a fenced JSON block on its own, in exactly this \
format (use null where you don't have a confident value):
```json
{{"sqft": <number or null>, "source": "<short source name or null>", "confident": <true or false>, "bedrooms": <number or null>, "bathrooms": <number or null>}}
```
"""

NAMEPLATE_SYSTEM_PROMPT_TEMPLATE = """You are a field assistant for HVAC \
sales reps, reading a photo of an equipment nameplate sticker (furnace side \
panel or condenser top/back panel).

1. Read the model number and any BTU/tonnage figures visible on the label.
2. Decode the model number and/or BTU rating into tonnage using the rules \
in the knowledge base below — but ONLY if the digits cleanly match a \
standard tonnage code (e.g. 018/024/030/036/042/048/060 = 1.5/2/2.5/3/3.5/4/5 \
ton). Do not force-fit a tonnage onto digits that don't cleanly match — \
real systems are sold in 0.5-ton steps, so a result like "2.9 tons" is a \
sign you guessed wrong, not a real answer. If the code doesn't clearly \
match, say tonnage isn't confidently determinable from the model number, \
and suggest the rep cross-check via the AHRI directory \
(www.ahridirectory.org, often printed right on the label) or the \
manufacturer's own model lookup.
3. Look for an explicit manufacture date on the label. If you find one, \
report it EXACTLY as printed — do not calculate an age yourself, the \
server does that math deterministically. If no date is visible, do NOT \
guess age from a serial number — the knowledge base explains why. Say \
plainly that age could not be determined from this photo, and suggest the \
rep look it up via the manufacturer's official age lookup using the brand \
and serial number.
4. If the nameplate is illegible or you can't confidently read the model \
number, say so plainly rather than guessing.

Explain what you found to the rep in a few short, direct sentences.

--- KNOWLEDGE BASE ---
{knowledge_base}
--- END KNOWLEDGE BASE ---

End your response with a fenced JSON block on its own, in exactly this \
format (use null where you don't have a confident value). manufacture_date \
must be "YYYY-MM" if a month is visible, "YYYY" if only a year is visible, \
or null — never a calculated age:
```json
{{"model_number": <string or null>, "brand": <string or null>, "tonnage": <number or null>, "btu": <number or null>, "manufacture_date": "<YYYY-MM, YYYY, or null>", "age_source": "<'printed manufacture date' or 'not determinable' or null>"}}
```
"""

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def frontend_assets(filename):
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/api/chat", methods=["POST"])
def chat():
    client = get_client()
    if client is None:
        return jsonify({
            "error": "No OpenAI API key configured. Add OPENAI_API_KEY to "
                     "backend/.env (copy backend/.env.example) and restart "
                     "the server."
        }), 400

    data = request.get_json(force=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []  # [{role, content}, ...]

    if not message:
        return jsonify({"error": "Empty message."}), 400

    system_prompt = CHAT_SYSTEM_PROMPT_TEMPLATE.format(
        knowledge_base=load_knowledge_base()
    )

    input_messages = [{"role": "system", "content": system_prompt}]
    for turn in history:
        role = turn.get("role")
        content = turn.get("content")
        if role in ("user", "assistant") and content:
            input_messages.append({"role": role, "content": content})
    input_messages.append({"role": "user", "content": message})

    kwargs = {"model": MODEL, "input": input_messages}
    if needs_web_search(message):
        kwargs["tools"] = [{"type": "web_search"}]

    try:
        response = client.responses.create(**kwargs)
        answer = response.output_text
    except Exception as e:  # surfaced to the UI, not a stack trace
        return jsonify({"error": f"OpenAI request failed: {e}"}), 502

    return jsonify({"answer": answer, "used_web_search": "tools" in kwargs})


@app.route("/api/lookup-sqft", methods=["POST"])
def lookup_sqft():
    client = get_client()
    if client is None:
        return jsonify({
            "error": "No OpenAI API key configured. Add OPENAI_API_KEY to "
                     "backend/.env (copy backend/.env.example) and restart "
                     "the server."
        }), 400

    data = request.get_json(force=True) or {}
    address = (data.get("address") or "").strip()

    if not address:
        return jsonify({"error": "No address provided."}), 400

    input_messages = [
        {"role": "system", "content": SQFT_SYSTEM_PROMPT},
        {"role": "user", "content": f"Property address: {address}"},
    ]

    try:
        response = client.responses.create(
            model=MODEL,
            input=input_messages,
            tools=[{"type": "web_search"}],
        )
        raw_answer = response.output_text
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 502

    display_text, parsed = parse_structured(raw_answer)
    parsed = parsed or {}

    return jsonify({
        "answer": display_text,
        "sqft": parsed.get("sqft"),
        "source": parsed.get("source"),
        "confident": bool(parsed.get("confident")),
        "bedrooms": parsed.get("bedrooms"),
        "bathrooms": parsed.get("bathrooms"),
    })


@app.route("/api/nameplate", methods=["POST"])
def nameplate():
    client = get_client()
    if client is None:
        return jsonify({
            "error": "No OpenAI API key configured. Add OPENAI_API_KEY to "
                     "backend/.env (copy backend/.env.example) and restart "
                     "the server."
        }), 400

    data = request.get_json(force=True) or {}
    image_data_url = data.get("image")  # data:image/...;base64,....

    if not image_data_url:
        return jsonify({"error": "No image provided."}), 400

    try:
        image_data_url = normalize_image_to_jpeg(image_data_url)
    except Exception as e:
        return jsonify({"error": f"Could not read that photo (unsupported or corrupt image file): {e}"}), 400

    system_prompt = NAMEPLATE_SYSTEM_PROMPT_TEMPLATE.format(
        knowledge_base=load_knowledge_base()
    )

    input_messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Here is a photo of the equipment nameplate."},
                {"type": "input_image", "image_url": image_data_url},
            ],
        },
    ]

    try:
        response = client.responses.create(model=MODEL, input=input_messages)
        raw_answer = response.output_text
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 502

    display_text, parsed = parse_structured(raw_answer)
    parsed = parsed or {}
    age_years = compute_age_years(parsed.get("manufacture_date"))

    return jsonify({
        "answer": display_text,
        "model_number": parsed.get("model_number"),
        "brand": parsed.get("brand"),
        "tonnage": parsed.get("tonnage"),
        "btu": parsed.get("btu"),
        "age_years": age_years,
        "age_source": parsed.get("age_source"),
    })


@app.route("/api/status")
def status():
    return jsonify({"api_key_configured": get_client() is not None})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
