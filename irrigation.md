# Garden Irrigation — Project State

**Last updated: 2026-09-07.** This file is the source of truth for the irrigation
sub-project. It supersedes the 2026-09-06 kit-selection handoff, now archived with its
2,300-line primary-source research in [`docs/irrigation/`](docs/irrigation/). That handoff's
picks were independently cross-checked and **survive**; corrections to it are in §4 and the
alternatives it rejected are summarised in §12 so they are not re-litigated.

**Status: ALL HARDWARE ORDERED OR IN HAND. One open compliance thread (§5) — in active
conversation with Thames Water. Nothing installed yet; soft landscaping (compost/planting)
waits on pipe-laying only.**

How to maintain: when a decision changes, edit the relevant section *and* §9 open items in
the same commit. Dated progress lands in `project.md` → Progress Notes. Start every new
irrigation session by reading this file; §10 lists the natural one-topic sessions.

---

## 1. Decisions locked

| Item | Decision |
|---|---|
| Controller | 2 × LinkTap G2S + 2 × FM-20S Micro Flow Meter + GW-02 gateway (confirmed GW-02 in the Amazon bundle) |
| Tap split | Brass 4-way manifold with per-outlet ball valves (Photener, ¾" BSP) — **replaces** the Gardena Twin-Tap plan. G2S units on the two outer angled ports, hose (existing Gardena connector, reused) on an inner port, 4th port spare/closed |
| Zone 1 (border) | 25m PC inline dripline kit (irrigationonline KIT0104), extra punched drippers at each fruit tree |
| Zone 2 (planter) | Patio kit (KIT0120): plain 16mm supply + 10 × 2 L/h Potpeckerlock drippers on 5mm tube |
| Per-zone conditioning | Amiad ¾" 120 mesh filter + Netafim ¾" 1.4 bar preset regulator — **×2 of each** (one full stack per zone; the old handoff's option (a), duplicates ordered) |
| Backflow | **In flux** — see §5. Indoor DCV route abandoned (supply branch unfindable); external integral-DCV bib tap replaces it |
| Soil sensors | **Deferred to spring 2027** (Ecowitt WH51 ×2 + GW1200 + optional WH40 rain gauge). Rationale: nothing needs laying now, G2S has weather-skip, first-season establishment watering wants fixed schedules anyway |
| D1 downgrade | Considered and rejected *with eyes open*: D1's non-removable 2–50 L/min meters can't detect drip-scale faults; silent-failure detection was a core goal. G2S pair premium (~£110) accepted |

The load-bearing number behind the controller choice: Zone 2 draws only **~0.33 L/min**
(10 × 2 L/h), below the flow-meter floor of nearly every tap timer on the market. Only the
LinkTap Micro Flow Meter (0.2–5 L/min) covers both zones. If zone sizing ever changes, re-check
this first — see §12 and the archived research.

## 2. Purchases

**Amazon (arrived):** G2S + GW-02 bundle £139 · add-on G2S £99 · 2 × FM-20S £42 ·
Photener 4-way brass manifold £33.95. Total £313.95.

**irrigationonline.co.uk (ordered):** Dripline kit £36 · Patio kit £45 · Amiad filter
×2 £21.40 · 1.4 bar regulator ×2 £15.66 (all ex VAT).

**Screwfix (basket/bought):** Flomasta 15mm DCV £4.89 + 15mm full-bore lever valve —
**now surplus** unless the indoor supply branch is ever located (keep in parts drawer).
**To buy instead:** WRAS-approved ½" bib tap with integral double check valve, ¾" hose
union outlet (~£15–25, "outside tap double check valve" at Screwfix).

**Not yet bought:** point-of-use backsiphonage device per zone — blocked on §5.

## 3. The stack (order is load-bearing)

Mains → main stopcock (only isolation currently available — indoor branch valve not
found) → wall → **integral-DCV bib tap** (replaces existing plain tap, stamped
"22 W45 ½": batch code, no DCV, PTFE onto wall-plate elbow, 15-min swap) → **4-way
manifold** → per zone:

**G2S → FM-20S (replaces standard meter on G2S outlet) → Amiad filter → 1.4 bar
regulator (flow arrow away from tap) → [FC4 device, pending §5] → 16mm×¾" tap
connector → 16mm LDPE supply pipe.**

Rules encoded in that order: valves before conditioning; filter before regulator;
backsiphonage device **last** — nothing valve-like downstream of it, vents down,
≥300mm above highest dripline point. Expect a brief vent dribble at end of each cycle
(normal operation, not a leak).

Garden runs: both supply lines clipped along the deck's front face (rigid saddle
clips, not pegs — LDPE sags in heat). Zone 1 up the border by the left fence, dripline
pinned then buried by compost, figure-8 end at the far (top) end for flush/drain.
Zone 2 rises at the planter's fence-side end, loop inside, drippers repositionable on
5mm tube (courgettes get doubles).

**Bracket is ESSENTIAL, not optional:** two G2S stacks + manifold ≈ >2kg wet,
cantilevered off a ½" bib tap. Support manifold and/or each stack independently
(wall bracket or stakes).

## 4. Corrections/answers to the 2026-09-06 handoff

- §6(b) wording: shared filter/regulator leaves lines at **regulated ~1.4 bar static**
  (with creep), not "mains pressure". Conclusion unchanged; moot anyway — duplicates
  ordered, option (a) taken.
- §6(a) open item CLOSED: second filter+regulator ≈ £22 inc VAT, ordered.
- §10 "outlet thread" — FM-20S confirmed G2S/G2-only, fits G2S outlet; LinkTap Q1 and
  D1 cannot take it (Q1 has own built-in meters — checked, rejected same as D1).
- NEW open item the old doc missed: **gateway placement**. GW-02 talks to G2S over
  LinkTap's own radio (~200m open air), NOT WiFi. Place indoors as near the tap as
  possible, USB power. Pair G2S at the tap and check signal BEFORE
  plumbing (inside Amazon return window). LinkTap extender exists if marginal.
- Amazon UK (LinkTap-UK seller) beat link-tap.com direct: no £14 shipping, easy
  returns, BSP-threaded stock.
- Old doc's "anti-freeze auto-open" note partially answers its own "valve position on
  removal UNVERIFIED": G2S self-opens <~3°C; still run a manual cycle before autumn
  removal.
- Old doc §4 wanted the DCV **indoors** (G15.20: "located inside a building and protected
  from freezing"). Not achievable — the indoor supply branch could not be found. Accepted
  compromise: integral-DCV bib tap outdoors, and drain the exposed outside pipe every winter
  (§9). Worth mentioning to Thames Water in the same conversation.
- Old doc §10 open items now closed: outlet thread (FM-20S fits G2S — confirmed); existing
  tap has **no** integral DCV (stamped "22 W45 ½", physically inspected); second
  filter+regulator priced and ordered; Type DB sourcing → discontinued, see §5; WH40 rain
  gauge → deferred with the sensors to spring 2027.

## 5. OPEN THREAD — FC4 compliance (the only blocker to commissioning)

**Status 2026-09-07:** Arrow Valves **confirmed the Type DB pipe interrupter is
discontinued** (the last known UK maker of the type). Thames Water contacted via WhatsApp
and the conversation is **now live** — asking what they currently require for an
automated domestic drip system in place of the DB interrupter. **Awaiting their guidance.**
Water-fittings notification (Reg 5, item 4(h), automated garden watering) still to be
submitted — sensible to fold TW's guidance into the notification text. 10 working days'
silence after notification = deemed consent.

Fallback ladder if TW's answer is unhelpful or slow (best → worst):

1. **Another WRAS-approved DB-type / point-of-use backsiphonage device** from a
   different maker — the type is defined by the regs, not by Arrow. Ask TW to name
   an acceptable device; also worth asking City Irrigation Bromley (020 8462 4630)
   what they now supply for FC4 domestic drip.
2. **150mm route** (drops zones to FC3, where the integral-DCV tap alone suffices):
   Zone 2 = trivial (stake drippers 150mm above compost using kit's clamp stakes,
   zero new parts). Zone 1 = requires abandoning inline dripline for per-plant
   staked drippers off plain 16mm pipe (~£15–20 extra Antelco drippers; dripline kit
   becomes surplus; worse horticulture, fully legal). Hybrid possible: convert
   planter only, one device for border only.
3. RPZ-type arrangement — exists, >£100 + annual testing, do not want.

Facts already established for the TW conversation: system is FC4 (soil-contact
dripline, domestic garden, per G15.23-type guidance); DCV alone covers FC3 only;
the old "DB + DCV" architecture matched Arrow's own datasheet. US-style hose-thread
vacuum breakers (e.g. Rain Bird HT075BFFS) are the functional twin but NOT
WRAS-approved and have GHT (not BSP) threads — fails the paperwork and the seal.
Emitter-level "anti-siphon" claims (Potpeckerlock etc.) are product features, not
approved devices — irrelevant to the assessment.

**Everything else proceeds regardless:** pipe laying, compost, planting, test cycles,
HA integration. Only unattended daily service waits on the compliance answer.

## 6. Interaction with the lawn seeding plan (see `project.md`)

Found while syncing this doc into the repo — **unresolved, decide before sowing.**

The lawn plan assumed germination watering (top 10mm moist, roughly **9–30 Sept 2026**)
would be automated by "the Gardena duo tap timer + smart multi-zone irrigation
controller". That plan is superseded: the Gardena Twin-Tap is out, both G2S units are
allocated to the two drip zones (which cannot run unattended until §5 resolves), and in
the current manifold layout the sprinkler hose sits on an inner port with **no timer**.

Candidate resolutions (not yet decided):

- **A.** Temporarily run the Verve sprinkler hose from one G2S during germination weeks,
  then move that G2S to its drip zone. Zero cost. A hose-end sprinkler is the ordinary
  above-ground case the integral-DCV tap already covers (likely FC3 — confirm in the same
  TW conversation), so it has no §5 dependency.
- **B.** Hand-started Verve sprinkler using its built-in 0–120 min mechanical timer (the
  lawn plan's stated stopgap). Cannot start unattended.
- **C.** Buy a third timer for the hose port.

## 7. Install sequence (hardware day)

1. Gateway indoors nearest the tap → app setup
2. Pair both G2S **at the tap**, check signal (return window!)
3. Swap standard meters for FM-20S on each G2S
4. Swap bib tap for integral-DCV tap (main stopcock off, PTFE, 15 min)
5. Manifold on tap; assemble both stacks; bracket/stake them
6. Lay 16mm runs along deck face (saddle clips); zone 1 dripline pinned in border,
   tree drippers punched; zone 2 loop into planter
7. Flush both lines with ends open before fitting stop ends
8. **Then** compost over the border run; fill planter (drainage crocks first); plant
9. Manual test cycles per zone; check FM-20S readings register (~1.1–1.3 L/min Z1,
   ~0.33 L/min Z2)

## 8. Home Assistant-side tasks (unchanged from old doc §11, none done)

These live in the Home Assistant repo, not here.

- Create **Garden** area (all existing areas are indoor; the repo's parity tooling ignores
  area-less entities)
- HACS: `sh00t2kill/linktap_local_http_component` (gateway local HTTP API)
- Label tuning knobs `plumbing`; run the repo's parity check after onboarding
- Automations v1 (no soil sensors yet): per-zone schedules (Z2 frequent/shallow,
  Z1 infrequent/deep), forecast-based skip via the HA forecast weather entity (daily+hourly,
  precip mm), FM-20S anomaly alerts (no-flow / unexpected-flow), G2S battery alerts
- Spring 2027: add Ecowitt (`ecowitt` core integration, `local_push`, gateway posts
  to the port HA actually serves on — verify, don't assume 8123; battery arrives as VOLTS ~1.2V threshold;
  moisture % is a raw index needing per-soil calibration — template sensors in YAML;
  WH51L variant for spots that pond; WH40 rain gauge for observed-rain skip)

## 9. Winterising (annual, ~2 min once tap swap done)

Manual open cycle on each G2S → main stopcock off (or indoor isolator if branch ever
found) → open bib tap to drain exposed outside pipe (photos show supply rises up the
external wall — freeze risk independent of irrigation) → unscrew stacks, drain,
indoors, batteries out → figure-8 ends loose per Rain Bird practice. G2S anti-freeze
auto-open is a backstop, not the plan.

## 10. Open items

- [ ] Thames Water response (conversation live via WhatsApp) → fold into water-fittings
      notification, submit
- [ ] Buy FC4 device per TW guidance (or execute 150mm fallback)
- [ ] **Decide lawn germination watering timer** (§6) — before sowing, ~9 Sept
- [ ] Buy integral-DCV bib tap (Screwfix)
- [ ] Return/drawer the Flomasta DCV + lever valve
- [ ] Bracket/stake solution for manifold + stacks
- [ ] Gateway↔G2S signal test on arrival day (return window)
- [ ] Ask builder where the indoor supply branch runs (nice-to-have now, not blocking)
- [ ] Pi tasks §8
- [ ] Reflect irrigation in the garden site (Plan tasks, Materials, Budget) — currently
      only in `project.md` budget table and these docs, not in the live Firebase data

## 11. Suggested next sessions (one topic each)

1. **Compliance** — process TW's reply, choose device or 150mm route, draft and submit the
   water-fittings notification.
2. **Lawn watering decision** — resolve §6 before the 9 Sept sowing window.
3. **Hardware day** — walk §7 with photos into the journal; record FM-20S baseline flows.
4. **Home Assistant integration** — §8, in the Home Assistant repo.
5. **Site sync** — add an irrigation phase/tasks, materials and budget line to the app
   (pattern: `scripts/sync-phase4-tasks.ts`, dry-run first).

## 12. Rejected alternatives (so they are not re-litigated)

Full reasoning with verbatim quotes and URLs: `docs/irrigation/irrigation-kit-research-2026-09-06.md`.

| Option | Why not |
|---|---|
| LinkTap D1-B (one-box, two zones) | Non-removable 2–50 L/min meters; cannot take the Micro Flow Meter, so drip-scale faults are undetectable |
| LinkTap Q1 | Same built-in-meter problem as D1 |
| Gardena smart Dual Water Control 19034-20 | **Not** because it is cloud-only — GARDENA publish a genuinely local HACS integration. Lost on: that integration being a v0.2.0 preview on an "experimental" gateway service shipped disabled; gateway out of stock; vertical-only mounting that a Twin-Tap's angled outlets may break |
| GIEX GX03 (Zigbee) | Open Z2M issue (valve 2 ON falsely reports valve 1 active); the house Z2M mesh has no mains router able to reach the garden |
| Netro Pixie | Cloud polling, single outlet |
| RainPoint / Diivoo | HomGar cloud platform; RF/BLE behind a gateway |
| Hozelock Cloud Controller | Hozelock state it ceases to function end of April 2027; no HA integration |
| DIY ESPHome + latching valves | Viable local-push route, but Rain Bird LFV075 bottoms out at 45 L/h, so Zone 2 is out of spec |
| Gardena Twin-Tap splitter | Replaced by the Photener brass 4-way manifold (per-outlet ball valves, room for hose + spare) |
| Indoor DCV + isolator (Flomasta) | Supply branch unfindable; parts kept in drawer |
| Rain Bird HT075BFFS hose-thread vacuum breaker | Functional twin of a Type DB but not WRAS-approved and GHT-threaded — fails paperwork and seal |
| Zigbee/Tuya soil sensors | Multiple open Z2M battery-reporting issues; Ecowitt WH51 chosen (deferred to 2027) |
