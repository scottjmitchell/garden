# Garden Irrigation — Project State

**Last updated: 2026-09-07.** This file is the source of truth for the irrigation
sub-project. It supersedes the 2026-09-06 kit-selection handoff, now archived with its
2,300-line primary-source research in [`docs/irrigation/`](docs/irrigation/). That handoff's
picks were independently cross-checked and **survive**; corrections to it are in §4 and the
alternatives it rejected are summarised in §12 so they are not re-litigated.

**Status (2026-09-14): ALL HARDWARE IN HAND; FC3 redesign settled (§5). Thames Water refused
the on-soil dripline design (no Type DB device exists); both zones move to fluid category 3 with
every emitter ≥150mm above the finished mulch. The extension invoice confirms a double check
valve on the outside tap's indoor supply, so no tap change is needed. Remaining: reply to TW,
submit the notification, buy ~£45–70 of stakes/pipe, then install on consent.**

How to maintain: when a decision changes, edit the relevant section *and* §9 open items in
the same commit. Dated progress lands in `project.md` → Progress Notes. Start every new
irrigation session by reading this file; §10 lists the natural one-topic sessions.

---

## 1. Decisions locked

| Item | Decision |
|---|---|
| Controller | 2 × LinkTap G2S + 2 × FM-20S Micro Flow Meter + GW-02 gateway (confirmed GW-02 in the Amazon bundle) |
| Tap split | Brass 4-way manifold with per-outlet ball valves (Photener, ¾" BSP) — **replaces** the Gardena Twin-Tap plan. G2S units on the two outer angled ports, hose (existing Gardena connector, reused) on an inner port, 4th port spare/closed |
| Zone 1 (border) | 25m PC inline dripline kit (irrigationonline KIT0104) — **to be revised for FC3**: emitters must sit ≥150mm above soil. Staked drippers vs suspended dripline: §5 |
| Zone 2 (planter) | Patio kit (KIT0120): plain 16mm supply + 10 × 2 L/h Potpeckerlock drippers on 5mm tube, staked ≥150mm above the compost (FC3) |
| Per-zone conditioning | Amiad ¾" 120 mesh filter + Netafim ¾" 1.4 bar preset regulator — **×2 of each** (one full stack per zone; the old handoff's option (a), duplicates ordered) |
| Backflow | **FC3 route** — see §5. Protection = double check valve on the outside tap's indoor supply, **confirmed 2026-09-14 from the extension builder's invoice** (wording verified: "double check valve"). Existing tap retained; integral-DCV tap not needed |
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
**Not needed (2026-09-14):** the integral-DCV bib tap — the extension invoice confirms a DCV on
the indoor supply to the outside tap.

**No longer needed:** per-zone backsiphonage device — the FC3 route (§5) removes it.
**Possibly needed instead:** Zone 1 staked drippers, plain 16mm LDPE and stakes (~£25–45),
plus BS 1710 non-potable marking tape — depends on the §5 option.

## 3. The stack (order is load-bearing)

Mains → main stopcock (only isolation currently available — indoor branch valve not
found) → wall → **integral-DCV bib tap** (replaces existing plain tap, stamped
"22 W45 ½": batch code, no DCV, PTFE onto wall-plate elbow, 15-min swap) → **4-way
manifold** → per zone:

**G2S → FM-20S (replaces standard meter on G2S outlet) → Amiad filter → 1.4 bar
regulator (flow arrow away from tap) → 16mm×¾" tap connector → 16mm LDPE supply pipe.**

Rules encoded in that order: valves before conditioning; filter before regulator. Backflow
protection sits upstream of everything, on the tap's supply (§5); there is no longer a per-zone
backsiphonage device in the stack. **Every emitter is held ≥150mm above the soil surface** —
that height is the compliance feature that makes this FC3, not a horticultural preference.

Garden runs: both supply lines clipped along the deck's front face (rigid saddle
clips, not pegs — LDPE sags in heat). Zone 1 up the border by the left fence with emitters
staked ≥150mm above soil — not buried (see §5 for dripline vs drippers) — figure-8 end at the
far (top) end for flush/drain.
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

## 5. Compliance — Thames Water's answer and the FC3 redesign

### Timeline

- 2026-09-06: research established that on-soil domestic dripline is **fluid category 4**,
  needing a double check valve (DCV) **plus** a Type DB pipe interrupter (archived research).
- 2026-09-07: Arrow Valves confirmed the Type DB is discontinued. Thames Water contacted.
- **2026-09-11: Thames Water's Water Regulations team replied** (paraphrased):
  - Notification is a legal requirement; return their Notification of Works form at least
    10 days before starting. They respond within 10 days; conditions may apply.
  - With no approved Type DB device available they **will not approve a direct mains
    connection** for the system as described (on-soil dripline).
  - Their alternative: feed the irrigation **indirectly from a storage cistern with a Type AA
    or Type AB air gap** — i.e. break tank + pump, the FC5 arrangement in their guidance.
  - Send the completed form with a sketch and description; they grant or withhold consent.
  - Attached: WaterRegsUK "Hose Union Taps" booklet (Jan 2024 v1.1) and the Thames Water
    Regulation 5 Notification of Works form. Kept in Downloads, not committed.
- 2026-09-11: the builder who did the extension asked whether the outside-tap branch already
  has a servicing valve + DCV indoors.
- **2026-09-14: the extension invoice confirms a "double check valve" on the outside tap's
  supply** (wording verified). Backflow protection for FC3 is therefore already in place; the
  tap stays as it is. **No servicing valve on that branch** — not a backflow matter and not
  mandated for an outside-tap branch (Schedule 2 para 10 covers cisterns, float valves and
  appliances); TW's booklet shows one as good practice. Don't raise it as a question: describe
  isolation at the main stopcock and the winter drain-down instead. If TW condition consent on
  one, it's a small indoor plumbing job.

**Direction set 2026-09-11: reject the break tank; redesign both zones to fluid category 3.**
A break tank + pump is disproportionate for a two-zone domestic drip system (tank, pump, power,
space, cost — and a pump over 12 L/min is itself notifiable under Table 5 item 4(d)).

### Why emitters ≥150mm above soil is FC3 — and the caveat

- The Defra/WRAS guidance behind the FC4 finding treats emitters **held at least 150mm above
  the soil** as FC3, where a DCV alone is sufficient. It is emitters on or in the soil that are
  FC4. Full clause text in the archived research.
- Thames Water's own attachment agrees for the tap: hoses used solely for watering a domestic
  garden are "typically" FC3, protected by a DCV. The FC3 arrangement it draws is a
  **servicing valve + double check valve inside the thermal envelope**, pipe through the wall
  in a duct sealed at both ends, insulated, then the outdoor hose union tap.
- **Caveat:** the same booklet says the undertaker has "absolute discretion" and lists what it
  weighs for watering systems: chemical additives; system design (pop-up heads, **seep hoses**);
  what is below ground versus permanently fixed above ground; size and environment. FC3 is the
  correct, defensible classification for the redesigned system, but it is TW's call — the
  notification must describe the design in exactly those terms and ask them to confirm.

### What the FC3 route requires (beyond the servicing valve + DCV)

1. **Backflow protection at the tap supply.** ✅ A DCV on the indoor supply is confirmed by the
   extension invoice (2026-09-14). Quote the invoice line and date in the notification; attach
   a copy if asked. No servicing valve on the branch; isolation is the main stopcock (§9) plus
   the manifold ball valves downstream of the tap.
2. **Every emitter ≥150mm above the soil/mulch surface, permanently fixed on stakes**, and kept
   there as compost and mulch levels rise. Nothing on or in the ground; no ponding at emitters.
3. **No chemical additives** — no fertigation or fertiliser injectors. State it in the form.
4. **Notify under Regulation 5, Table 5 item 4(h)** (garden watering system not operated by
   hand) — mandatory whatever the category. Form Section 4: for 4(h) in a house "a brief
   description and a sketch will be sufficient". Email to water.regulations@thameswater.co.uk at
   least 10 working days before starting; comply with any conditions. Describe the surface-laid
   LDPE too, so item 4(i) (outdoor pipework less than 750mm deep) is covered in the same form.
5. **Mark the irrigation pipework as non-potable** in line with BS 1710 (identification
   tape/labels on the 16mm LDPE) — the booklet asks for this to avoid cross-connection.
6. **Frost and waste.** Insulate/duct any new through-wall pipe; drain and remove seasonally
   (§9). Disconnect the hand hose from the manifold when not in use.
7. **Include the lawn sprinkler.** A Verve oscillating sprinkler run from the manifold on a
   timer is also a watering system not operated by hand — above ground, FC3, covered by the same
   DCV — but list it so consent covers it.
8. **Schedule of fittings** on the sketch: G2S ×2, FM-20S ×2, Amiad filter ×2, Netafim
   regulator ×2, brass manifold, DCV/tap. TW may ask about approval status.

### Zone impact

- **Zone 2 (planter):** trivial. Stake the 10 drippers ≥150mm above the compost with the kit's
  clamp stakes. Zero new parts — check the stakes are tall enough.
- **Zone 1 (border):** two options, decide once TW answers:
  - **(a) Per-plant staked drippers** off plain 16mm LDPE — unambiguous FC3. Needs ~15–25m plain
    16mm LDPE (the inline dripline cannot be reused as plain pipe), 12–20 pressure-compensating
    drippers (2–4 L/h), 5mm tube and stakes. Roughly £25–45. The dripline kit (£36 ex VAT)
    becomes surplus. Recompute flow (e.g. 15 × 2 L/h = 0.5 L/min — inside the FM-20S range).
  - **(b) Suspend the existing inline dripline ≥150mm above soil** on stakes/hooks — zero cost,
    but arguable: "seep hoses" are explicitly on TW's watch-list. Ask in the same email; only do
    it with a written yes.
- Horticulture: above-soil emitters lose some water to evaporation and wet a smaller footprint
  than buried dripline. Mulch under each emitter and water early morning. Acceptable.

### Next actions, in order

1. ~~Builder's answer~~ — done via the invoice (2026-09-14).
2. Reply to the TW Water Regulations contact describing the FC3 redesign and asking two things:
   (i) confirm DCV-only protection is acceptable with all emitters ≥150mm above the finished
   surface and no additives; (ii) does inline dripline suspended ≥150mm above the mulch count,
   or must it be discrete drippers.
3. Submit the notification form + sketch + description (draft below) at least 10 working days
   before hardware day.
4. Buy Zone 1 parts for whichever emitter type TW accepts.

### Zone 1 layout decision (2026-09-11)

Surface-lay the plain 16mm along the back of the border on pegs and hide it under bark mulch —
not buried in soil. The pipe carries no outlets so its position is irrelevant to the category,
every joint stays inspectable, and the shallow-burial rules (item 4(i), Schedule 2 depth) never
arise. **Measure the 150mm from the top of the mulch**, not the soil: aim for ~200mm so mulch
top-ups don't erode the margin. Take-offs at the surface, never below it.

### Parts to buy for the FC3 conversion (~£45–70, one irrigationonline basket)

| Item | Qty | Why |
|---|---|---|
| Riser stakes for 5mm tube, 300mm | 30 | 10 planter + up to 20 border. Kit clamp stakes are too short for 150mm above mulch |
| 2 L/h PC drippers | 20 | Border, one per plant, two per fruit tree |
| 5mm micro tube | 25m | Risers (~0.6m each). Check kit leftover first |
| Plain 16mm LDPE | 25m | Border supply; dripline can't be reused as plain pipe. Check kit leftover first |
| 16mm pegs/hooks | 20 | Pin surface run before mulching |
| 16mm tee/elbows/figure-8 | as needed | Dripline kit fittings fit plain 16mm — likely nothing |
| Non-potable ID tape | 1 roll | BS 1710-style marking along both runs |
| Integral-DCV bib tap | 0–1 | **Only** if the builder confirms no indoor DCV (~£15–25, Screwfix) |

Design flows after conversion: Zone 2 ~0.33 L/min; Zone 1 ~0.5–0.7 L/min for 15–20 drippers;
~1 L/min total. Both inside the FM-20S 0.2–5 L/min range.

### Draft description for the form (Section 4) — fill the brackets

> Alteration to an existing house: a small automatic garden watering system fed from the
> existing outside hose union tap (Table 5 item 4(h)). Fluid category 3 design — every emitter
> is held a minimum of 150mm above the soil/mulch surface on stakes; no emitters on or in the
> ground; no chemical dosing. Backflow protection: a double check valve on the supply to the
> outside tap inside the building, fitted by our builder as part of the [year] extension
> (invoice available on request). The existing tap is retained unchanged; the manifold's ball
> valves isolate each new branch downstream of it. Downstream of the tap: brass 4-way manifold with isolating ball
> valves → two battery tap timers (LinkTap G2S with 0.2–5 L/min flow meters) → 120-mesh filter
> and 1.4 bar pressure regulator per zone → plain unperforated 16mm LDPE laid on the surface
> (under bark mulch in the border, no joints below ground), marked as irrigation/non-potable → Zone 1: [N] pressure-compensating drippers of ~2 L/h along
> the left border on stakes; Zone 2: 10 × 2 L/h drippers on stakes in a raised planter. Design
> flow about [X] L/min total. Third manifold outlet: hand hose, plus a temporary lawn sprinkler
> during grass establishment. Each autumn the assembly is removed, drained and stored indoors;
> the supply is isolated at the main stopcock and the outside tap opened to drain the exposed
> pipe. Start date: [ ].

**Everything else proceeds regardless:** pipe laying, compost, planting, test cycles, HA
integration. Only unattended service waits on consent.

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
6. Lay 16mm runs along deck face (saddle clips); zone 1 emitters staked ≥150mm above soil
   along the border (option per §5); zone 2 loop into planter, drippers staked ≥150mm above
   compost. Fit BS 1710 non-potable marking to the LDPE
7. Flush both lines with ends open before fitting stop ends
8. **Then** compost the border — emitters must stay ≥150mm above the finished mulch level;
   fill planter (drainage crocks first); plant
9. Manual test cycles per zone; check FM-20S readings register (Z2 ~0.33 L/min; Z1 depends
   on the final emitter count — recompute, must stay inside 0.2–5 L/min)

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

- [x] Builder / DCV: extension invoice confirms a "double check valve" on the outside tap's
      supply (2026-09-14, wording verified). No servicing valve on the branch — omit, not a
      backflow matter
- [ ] Reply to Thames Water with the FC3 redesign and the two questions in §5
- [ ] Submit the Regulation 5 notification form + sketch + description (§5 draft), at least
      10 working days before hardware day
- [ ] Choose the Zone 1 implementation (staked drippers vs suspended dripline) once TW answer;
      buy parts
- [ ] **Decide lawn germination watering timer** (§6)
- [ ] Return/drawer the Flomasta DCV + lever valve (surplus)
- [ ] BS 1710 non-potable marking tape for the LDPE
- [ ] Bracket/stake solution for manifold + stacks
- [ ] Gateway↔G2S signal test on arrival day (return window)
- [ ] Pi tasks §8
- [ ] Reflect irrigation in the garden site (Plan tasks, Materials, Budget) — currently
      only in `project.md` budget table and these docs, not in the live Firebase data

## 11. Suggested next sessions (one topic each)

1. **Compliance** — after the builder's answer: reply to TW, settle the Zone 1 option, draw
   the sketch and submit the notification (§5).
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
| Indoor DCV + isolator (Flomasta) | Not needed — the extension already has a DCV on the branch (confirmed from the invoice 2026-09-14); parts kept in drawer |
| Rain Bird HT075BFFS hose-thread vacuum breaker | Functional twin of a Type DB but not WRAS-approved and GHT-threaded — fails paperwork and seal |
| Break tank + pump with Type AA/AB air gap (Thames Water's suggested FC5 arrangement, 2026-09-11) | Correct for on-soil or buried dripline, but disproportionate for a two-zone domestic drip system: tank, pump, power, space, cost, and a pump over 12 L/min is itself notifiable. Rejected in favour of redesigning to FC3 |
| On-soil / buried inline dripline (the original Zone 1 design) | FC4; the only approved device type is discontinued and TW will not consent to a direct connection without one |
| Zigbee/Tuya soil sensors | Multiple open Z2M battery-reporting issues; Ecowitt WH51 chosen (deferred to 2027) |
