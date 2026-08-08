# Generic HVAC Sizing Knowledge (v1 seed content)

This file is the shared knowledge base — company-agnostic, no pricing, no
per-customer data. It gets embedded directly into the system prompt sent to
the model (no vector DB for v1, see goal.txt section 5).

Source: transcribed from two reference images (HVAC training booklet sizing
pages + a duct CFM reference chart). Original image files should be placed
in `../reference/` — see reference/README.txt.

---

## Why sizing matters

Getting the size wrong is one of the most common and costly mistakes in
HVAC. An undersized unit runs constantly and never reaches temperature. An
oversized unit short-cycles (turns on and off rapidly), causing premature
wear and inefficiency. Always verify BOTH the square footage served AND the
actual duct CFM — sizing off square footage alone can miss an undersized or
oversized duct system.

## AC sizing: don't just match the furnace's BTU

You cannot size an AC off the BTU rating of the existing furnace. Heating
and cooling are different physics problems:
- Heating load depends on the temperature difference between indoors and the
  coldest winter design temperature.
- Cooling load depends on summer heat, humidity, sun exposure (window count
  and orientation), and indoor heat sources.

The only fully precise method is a **Manual J Load Calculation**, which
accounts for:
- Square footage (total livable area)
- Climate zone (local summer design temperature and humidity)
- Sun exposure (window count and which directions they face)
- Insulation quality (attic and wall R-value)

**Regional rule-of-thumb estimate** (a starting point for a conversation,
not a substitute for Manual J):

| Climate | Sqft per ton of cooling |
|---|---|
| Hot climates | 400–500 sqft/ton |
| Moderate climates | 500–600 sqft/ton |
| Cool climates | 600–700 sqft/ton |

(1 ton of cooling = 12,000 BTU.)

This roughly lines up with the "Cooling sqft (AC): 600" figure in the
per-ton reference table below, which reflects a moderate-climate assumption
— it is not a universal constant, and should be adjusted using the table
above for hot or cool climates.

**When a rep asks for help sizing an AC, ask for:**
- City and state (to determine climate zone)
- Total square footage of the area to cool
- Age of the home, or window quality (single- vs. dual-pane, etc.)

Then give a closer estimate using the regional rule of thumb above, and note
that a full Manual J calculation, done by a qualified tech, is the only
precise method for a final sizing decision — this estimate is for
conversation, not for final quoting.

## Central AC / Furnace tonnage vs. home square footage

This table is furnace (heating) sizing. Do not reuse it directly for AC
sizing — see "AC sizing" above for why heating and cooling loads differ and
how to estimate cooling tonnage separately.

| Tonnage | Home Sq Ft (Furnace) |
|---------|----------------------|
| 2 Ton   | < 1,100 sqft |
| 2.5 Ton | 1,100–1,400 sqft |
| 3 Ton   | 1,400–1,600 sqft |
| 3.5 Ton | 1,600–1,800 sqft |
| 4 Ton   | 1,800–2,200 sqft |
| 5 Ton   | 2,200–2,600 sqft |

Uninsulated spaces and spaces with ceilings above 8ft may need a larger unit
than this table alone suggests — treat the table as a starting point, not a
hard rule, in those cases.

## Per-1-ton reference (use to validate sizing and duct calculations)

| Metric | Per 1 Ton |
|---|---|
| Heating sqft | 500 |
| Cooling sqft (AC) | 600 |
| Actual CFM (in practice) | 300 |
| Theoretical CFM (mfr spec) | 400 |
| BTU — Gas Furnace | 20,000 |
| BTU — AC & Heat Pump | 12,000 |
| Amps required (breaker) | 10A |

Note: ACs are often smaller in tonnage than the furnace they pair with,
because cooling requires less capacity per sqft than heating.

**Practical CFM check:** count the duct sizes connecting to the plenum,
calculate their combined CFM (see duct chart below), and compare it to the
expected output for the tonnage. Example: a 2,000 sqft home should have
about 1,200 CFM of supply ducts. If actual measured CFM is well below
that (e.g. 700 CFM), the ducts themselves are undersized regardless of what
size unit is installed — flag this to the homeowner.

## Mini-split BTU sizing (by room)

| BTU | Room Size | Typical Use | Notes |
|---|---|---|---|
| 7,000 BTU | < 200 sqft | Small bedroom | — |
| 9,000 BTU | 200–350 sqft | Bedroom / small office | Available in 115V |
| 12,000 BTU | 350–500 sqft | Large bedroom / studio | Available in 115V |
| 18,000 BTU | 500–650 sqft | Living room / large room | — |
| 24,000 BTU | 650–850 sqft | Open plan / large space | — |

Same caveat as above: uninsulated spaces and ceilings over 8ft may need a
larger unit than the table alone suggests.

## How to find BTU, tonnage, and age of existing equipment

Every piece of HVAC equipment has a nameplate sticker:
- Furnace: usually inside the side panel (may need to remove a cover).
- Condenser (outdoor AC/heat pump unit): usually on the top or back panel.

What to look for on the nameplate:
- **Model number** — SOMETIMES contains encoded size info, but only trust
  this when the digits cleanly match a standard tonnage code: 018, 024,
  030, 036, 042, 048, or 060 = 1.5, 2, 2.5, 3, 3.5, 4, or 5 ton
  respectively (e.g. "036" = 36,000 BTU = 3 ton). This is NOT universal
  across manufacturers and model lines — if the digits don't cleanly match
  one of those standard codes, don't force a tonnage guess out of them.
  Real systems are sold in 0.5-ton steps, so an answer like "2.9 tons" is a
  sign the code was misread, not a real answer. When the model number
  doesn't clearly decode, say so and point to the AHRI directory
  (www.ahridirectory.org — often printed right on the label) or the
  manufacturer's own model lookup instead of guessing.
- **BTU rating** — listed as "Input BTU" (gas consumed) and "Output BTU"
  (heat produced). Use INPUT BTU for sizing furnaces. For ACs/heat pumps,
  look for a BTU or tonnage figure directly on the label.
- **Tons** — 12,000 BTU = 1 ton. Divide BTU by 12,000 to get tonnage.

**When a rep reads you a model number or BTU rating off a nameplate:** decode
it, state what you found, then check it against the tonnage-vs-sqft table
above using the square footage the rep provides. If the rep hasn't given
square footage yet, ask for it before finalizing a sizing recommendation —
don't just recommend "replace like-for-like," since the existing unit may
itself have been mis-sized.

### Determining the age of existing equipment — be careful here

Prefer an **explicit manufacture date** if one is printed on the nameplate
(often "Date of Manufacture," "MFG DATE," or a month/year stamp). That's a
direct, reliable answer.

If no explicit date is printed and only a serial number is visible: **do
not guess the age from the serial number.** Serial-number date coding is
manufacturer-specific — Carrier/Payne/Bryant, Trane, Goodman, Rheem, Lennox,
and others each use different, undocumented-here schemes, and guessing wrong
gives a rep false confidence in a number that drives a real sales decision
(see the replacement-vs-diagnostic rule below). If the age can't be
confidently read from an explicit date, say so plainly, note the brand and
serial number, and suggest the rep look it up via that manufacturer's
official age/warranty lookup tool rather than presenting an estimate as
fact.

## Replacement vs. diagnostic — the age decision rule

Once you know the existing system's age:
- **15 years or older:** recommend the rep position toward a replacement
  conversation rather than a repair. At this age, efficiency losses and
  rising failure risk generally make replacement the better economic case,
  especially if it's also mis-sized for the home.
- **Under 15 years:** recommend scheduling a diagnostic instead of jumping
  straight to a replacement pitch. A younger system with a problem is more
  likely to be a fixable issue than an end-of-life system.
- **Regardless of age:** if the existing unit's size doesn't match what the
  home actually needs (see tonnage-vs-sqft table above), flag that as a
  reason to discuss resizing on its own — a mis-sized system causes real
  problems (see "Why sizing matters") independent of how old it is.

## Total CFM needed for a duct map (the "×3" rule)

Most often a rep already knows the tonnage being installed (from unit
selection) and needs to work out total CFM in order to plan the duct map —
how many duct runs, of what size, to install.

**Formula: Total CFM needed = Tonnage × 300.** Field shorthand: multiply the
tonnage number by 3, then add two zeros.

Example: 3 tons × 300 CFM/ton = 900 CFM total needed. Using the duct size
chart below, that could be built from duct runs whose CFM ratings sum to
roughly 900 CFM — e.g. three 10" runs (300 CFM each), or a mix sized to the
actual room layout.

This also works in reverse as a sanity check: if you measure the actual
combined CFM of the existing ducts, divide by 300 (round down to the nearest
0.5 ton) to see what tonnage the current ductwork can actually support —
useful for catching an undersized duct system (see "Practical CFM check"
above).

## Duct sizing — flexible round duct, design airflow (CFM)

| Duct Size | Design Airflow (CFM) |
|---|---|
| 5" | 50 |
| 6" | 75 |
| 7" | 110 |
| 8" | 160 |
| 9" | 225 |
| 10" | 300 |
| 12" | 480 |
| 14" | 700 |
| 16" | 1,000 |
| 18" | 1,300 |
| 20" | 1,700 |

Reference note from source chart: flex duct runs roughly 0.05 in. w.c.
friction rate on most metal duct calculators — a standard design parameter,
not a hard conversion; treat as directional when cross-checking metal duct
sizing tools.

## New branch duct sizing — standard sizes only

For NEW duct runs being installed (as opposed to assessing what's already
in a home, which can be any size), only use three branch sizes based on
room type:

| Branch size | Room type |
|---|---|
| 4" | Bathrooms, laundry rooms, walk-in closets |
| 6" | Bedrooms, offices (standard rooms) |
| 8" | Larger rooms (living room, dining room) |

Kitchens are an exception worth checking on-site — they're sometimes small
enough to only need a 6" branch rather than the 8" a "larger room" would
normally get. Default to 6" for a kitchen and bump to 8" if it's actually
large, rather than assuming 8" automatically.

Larger rooms often need more than one vent — count vents needed per room,
not just the room count, when a space is big enough to require multiple
registers.

No odd sizes (5", 7", 9") for new branch runs — those only show up when
assessing existing ductwork someone else installed.

## Trunk sizing — how branches combine toward the plenum

As branch ducts run back toward the plenum, they combine into
progressively larger trunk segments. Use this combine table (not a generic
CFM formula) for new-duct design:

| Combining | Results in |
|---|---|
| 4" + 4" | 6" |
| 6" + 6" | 8" |
| 8" + 8" | 10" |
| 8" + 10" | 12" |
| 10" + 12" | 14" |

Work through branches smallest to largest, combining sequentially — e.g. a
job with 2 small rooms (4"), 1 standard room (6"), 2 larger rooms (8"), and
1 already-10"-equivalent trunk segment combines as: 4"+4"→6", then
+6"→8", then +8"→10", then +8"→12", then +10"→14". The final result is the
duct size needed at the plenum connection.

**Always verify the plenum has enough surface area to physically fit the
final combined connection size** before finalizing a design — a correct
CFM/size calculation doesn't help if the duct can't actually be mounted
where it needs to attach.

This combine table only covers what's listed above. If a layout needs a
combining step beyond it (uncommon sizes, more than one trunk line meeting
at the plenum, etc.), that calls for an actual Manual D duct design, not
this quick-reference table.

## Manual D — how duct systems are actually designed

Manual D ("Residential Duct Systems") is ACCA's industry-standard method for
sizing and laying out residential ductwork. It's the step that comes after
Manual J (room-by-room heating/cooling load calculation) and Manual S
(matching equipment to those loads): **Manual J → Manual S → Manual D** —
load calc, then equipment selection, then duct design. The CFM chart and
"×3" rule above are field shortcuts; Manual D is the real engineering
calculation behind them.

### Friction rate — the core concept

Every foot of duct, and every fitting (elbow, tee, boot, damper), resists
airflow and creates a pressure drop. Manual D's standard approach, the
**Equal Friction Method**, sizes every duct in the system to the same
target friction rate so the whole system balances by design.

**Friction rate formula:**
`Friction Rate (in. w.c. per 100 ft) = Available Static Pressure ÷ Total Effective Length × 100`

- **Available Static Pressure (ASP)** = the blower's rated total external
  static pressure (TESP) minus the pressure drops from the coil, filter,
  and other components in the airflow path.
- **Total Effective Length (TEL)** = the straight duct length of the
  longest run (supply + return combined) PLUS the "equivalent length" of
  every fitting on that run — elbows, boots, tees, and dampers each have a
  published equivalent-length penalty because they resist airflow more
  than the same length of straight duct.

Once you have a target friction rate, you look up the correct duct size for
the CFM that run needs to carry on a duct sizing chart/ductulator built for
that friction rate — the CFM chart above corresponds to a specific friction
rate, not a universal number. A commonly cited default residential design
friction rate is around 0.08 in. w.c. per 100 ft, but the correct value for
a given job depends on that system's actual static pressure budget — never
assume a friction rate without knowing the equipment's TESP and losses.

### Why flex duct is different

Flexible duct has a rougher interior than rigid metal duct, so it has
higher friction per foot at the same airflow — especially if it isn't
pulled fully taut or has kinks/sags. That's why the duct chart above is
built around a lower friction rate (0.05) than the ~0.08 default used for
metal duct: sizing flex duct a bit larger than a metal-duct calculator
would suggest compensates for its extra resistance.

### Layout approaches

- **Trunk-and-branch** — one or more central trunk lines carry supply air,
  with individual branch ducts splitting off to each room/register. Most
  common in residential work.
- **Radial** — individual duct runs go directly from a central plenum to
  each register, with no trunk line. Common with flex duct off a compact
  air handler.

### Supply and return balance

The system needs enough return-air path capacity to match what the supply
side delivers. Too few or too small return ducts/grilles can leave rooms
pressurized or starved even with correctly sized supply ducts. Rooms with a
door and no dedicated return (bedrooms, especially) often need a transfer
grille, jump duct, or undercut door to let air get back to the central
return path.

### What this means for a rep in the field

A full Manual D design is a calculation done with dedicated software or a
ductulator, using that specific equipment's static pressure rating — it is
not something to eyeball. In the field, the CFM chart and the "Total CFM
needed" rule above are enough to sanity-check whether existing ductwork is
in the right ballpark. A job that needs a real duct redesign (new
construction, major layout change, persistent airflow complaints after a
correctly-sized install) calls for an actual Manual D calculation, not a
rule of thumb.

---

## Flagging suspected asbestos in ductwork

Asbestos was commonly used in duct wrap, boots, plenums, and connectors in
homes built **before the 1980s**. There is no reliable lab test happening
during a sales walkthrough — this is a field visual flag, not a certified
determination.

**Field heuristic:** wrap or insulation on duct boots/plenum/connectors that
looks **white or off-white** (chalky, fibrous) is the practical tell,
especially combined with a home built before 1980. If a rep sees this, flag
it — don't attempt to confirm or rule out asbestos from a photo alone, and
don't touch/disturb the material.

**What flagging it means for the job:** suspected asbestos calls for an
abatement line item (priced by duct count, see the pricing catalog), not a
standard duct replacement quote. Don't recommend reinsulating or ignoring
old wrap that looks consistent with asbestos — abatement is the correct
path, and it's also a legitimate selling point (health hazard framing), not
just a cost.

---

## General objection-handling principles (v1, generic — no pricing)

These are general sales principles, not company-specific scripts or prices.
Per-customer scripts and figures belong in that customer's private pricing
module, not here.

- **Sizing skepticism ("why not just match what's there?")** — explain that
  the existing unit may already have been mis-sized, and that matching
  square footage + duct CFM is what prevents callbacks, not just installing
  the same tonnage that was already there.
- **"Isn't bigger better?"** — oversized equipment short-cycles: it turns on
  and off rapidly instead of running a full cycle, which wears out
  components faster and dehumidifies poorly. Bigger is not automatically
  better; correctly sized is better.
- **Permit/compliance pushback** — don't guess at current local code or
  rebate requirements from memory; look it up (this is what the
  permit/compliance web-search capability is for) rather than giving a
  homeowner a wrong answer about what's required.
