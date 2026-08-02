# Running the prototype

## 1. One-time setup

The virtual environment and dependencies are already installed (done during
build/testing). All that's left:

```
cd "/Users/theowallace/Desktop/HVAC salesman Q&A/backend"
cp .env.example .env
```

Open `.env` and paste in a real OpenAI API key (get one at
platform.openai.com -> API keys). Without this, the app runs but every
question returns "no API key configured."

(If you ever need to rebuild the environment from scratch: `python3 -m venv
venv && source venv/bin/activate && pip install -r requirements.txt`.)

## 2. Start the server

```
cd "/Users/theowallace/Desktop/HVAC salesman Q&A/backend"
source venv/bin/activate
python3 server.py
```

## 3. Open it

Go to **http://127.0.0.1:5050** in a browser (or on your phone if it's on
the same WiFi network — use your computer's local IP instead of 127.0.0.1).

Ask anything — sizing (furnace, AC, mini-split, ducts/Manual D), terminology,
or a permit/compliance/code/rebate question. Permit/compliance questions
automatically trigger a live web search instead of relying on the model's
memory.

## What this is / isn't yet

This is the Phase 1 MVP from `goal.txt` — a single demo account seeded with
the generic (non-EM-pricing) sizing knowledge base. It is NOT yet:
- Multi-tenant (no per-customer pricing module — that's Phase 2)
- Deployed anywhere (runs locally only)
- Using a vector database (the knowledge base is small enough to stuff
  directly into the prompt for now — see goal.txt section 5)
