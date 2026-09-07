> **ARCHIVED — superseded for decisions by [`../../irrigation.md`](../../irrigation.md) (2026-09-07).**
> Copied verbatim on 2026-09-07 from the Home Assistant repo worktree
> (`claude/smart-irrigation-setup-597b26`, `docs/irrigation-handoff-2026-09.md`), where it was
> still uncommitted. Kept as the record of *why* the kit was chosen. Its "nothing ordered" status
> and the Gardena Twin-Tap / indoor-DCV / Type DB assumptions are out of date. The two
> `learnings/` files it links to live in the Home Assistant repo, not here.

# Irrigation kit selection — handoff / cross-check sheet (2026-09-06)

Cross-check sheet for the deeper irrigation session. Full evidence with verbatim
quotes and URLs: `irrigation-kit-research-2026-09.md` (2,301 lines).

**Status: DECIDED, NOTHING ORDERED.** No hardware bought, nothing installed,
nothing on the Pi. This was a selection pass only.

---

## 1. The decision in one line each

| | Pick | Cost | HA route |
|---|---|---|---|
| Controller | 2 × **LinkTap G2S** (TP-2BS) + 2 × **Micro Flow Meter** (FM20-S-BSP) + 1 × **GW-02** gateway | £280 + £14 ship, link-tap.com | HACS `sh00t2kill/linktap_local_http_component` — gateway's **local HTTP API** |
| Soil sensors | 2 × **Ecowitt WH51** + 1 × **GW1200** gateway | £72, Weather Spares (in stock 2026-09-06) | **core** `ecowitt`, `local_push` |
| Backflow | Not built into ANY controller. Needs adding — see §4 | — | — |

---

## 2. THE load-bearing number — check this first

Everything hinges on one figure. If the deeper session has different zone sizing,
**the controller pick changes**, so verify this before anything else.

Derived from the emitter counts, not from a datasheet:

| Zone | Emitters | Flow |
|---|---|---|
| 1 — border dripline, 12–15 m @ 30 cm, 1.6 L/h | 40–50 | 64–80 L/h = **1.07–1.33 L/min** |
| 2 — raised planter, 10 × 2 L/h drippers | 10 | 20 L/h = **0.33 L/min** |
| Both together | | 84–100 L/h |

**Zone 2 at 0.33 L/min is what eliminates almost the entire market.** Metering ranges:

| Valve | Range (L/min) | Zone 1 | Zone 2 |
|---|---|---|---|
| **LinkTap G2S + Micro Flow Meter** | **0.2–5** | PASS | PASS |
| LinkTap D1 (built-in, non-removable) | 2–50 (or 1–50 — LinkTap's own pages disagree) | FAIL | FAIL |
| Gardena Dual | min "20–30 l/h" | PASS | **exactly on the floor** |
| Rain Bird LFV075 (the DIY route) | 0.76–18.9 | PASS | FAIL |
| RainPoint HTV245FRF | 5–35 | FAIL | FAIL |
| Orbit B-hyve | 9.5–34 | FAIL | FAIL |

---

## 3. Five things most likely to be lost in translation

1. **Two G2S units, NOT the one-box D1-B.** The D1 looks tidier and is cheaper per
   zone, but *"The LinkTap D1 water timer has two built-in, non-removable flow
   meters"* rated 2–50 L/min. It cannot take the Micro Flow Meter, so it forfeits
   the only remedy for the low flow. Do not "simplify" back to the D1.

2. **The Micro Flow Meter is not an optional accessory.** LinkTap's own advice at
   drip flow rates is to *disable* the water cut-off alert — i.e. the headline
   fault-detection feature is the first thing that breaks. The FM20-S is what buys
   it back. 2 × £21.

3. **"Gardena is cloud-only" is now FALSE and should not be repeated.** GARDENA GmbH
   publish their own local HACS integration (`cloudless-garden/ha-gardena-smart-local-preview`,
   `"iot_class": "local_push"`). Gardena was rejected for *other* reasons: v0.2.0
   preview on an "experimental" gateway WebSocket service shipped disabled, gateway
   out of stock, and a mounting constraint (§5).

4. **A double check valve alone is NOT legally sufficient.** See §4. This is the one
   place the original plan was wrong.

5. **Ecowitt gateway must point at port 80**, not the 8123 every published guide
   prints. Verified on this Pi: port 80 serves, 8123 refuses connection.

---

## 4. Backflow — the plan needs changing

**No controller has any.** Orbit is the only maker that even answers:
*"Hose End Timers do not have a backflow preventer."* Everyone else is silent.

A domestic garden dripline is **Fluid Category 4** — not 3, not 5. Both common
claims are wrong.

- **G15.23** (Defra guidance to the Water Supply (Water Fittings) Regulations 1999):
  house-garden porous hose needs a double check valve **PLUS a Type DB pipe
  interrupter**, sited at the tap connection or *"not less than 300 mm above... the
  perforated surface of the porous hose"*, discharging vertically downwards.
  Arithmetic: DCV (Type EC/ED) is rated FC3 only; Type DB is rated 4.
- The "FC5 / air gap" claim comes from **G15.19** — which sits under the heading
  *"Commercial and other installations excluding house gardens"*. Table 6.1e:
  FC5 covers *"Permeable pipes in other than domestic gardens"*.
- **The Type DB goes DOWNSTREAM of the timer**: arrangements with a Type DB
  *"shall have no control valves on the outlet of the device"*.
- **Emitters ≥150 mm above soil are FC3**, where a DCV alone IS sufficient. On-soil
  dripline is FC4. **Buried domestic dripline: UNVERIFIED** — no clause on point;
  FC4 defensible, FC5 arguable.
- **Notification to the water undertaker is legally required** — Reg 5, Table item
  **4(h)**, *"a garden watering system unless designed to be operated by hand"*.
  The approved-contractor exemption covers 4(b) and 4(g) but **not** 4(h). Silence
  for 10 working days = deemed consent.
- Put the DCV **indoors**: G15.20 wants it *"located inside a building and protected
  from freezing"*. A bolt-on at the tap becomes a frost casualty that isn't meant to
  come off each autumn.

---

## 5. Mounting — confirmed OK, and why Gardena was not

Splitter-first order is fine for the LinkTap. FAQ Q24: *"With an IP66 waterproof
design, the G1S / G2S / D1 / T1 / Q1 can be installed horizontally or upside down.
… make sure that water enters from the inlet of the water timer."* LinkTap
explicitly endorses tap splitters.

Gardena would have bitten: *"The Water Control may only be set up vertically with
the sleeve nut to the top to prevent water from penetrating into the battery
compartment."* A Twin-Tap's angled outlets may break that.

**No manufacturer addresses a cantilevered rigid stack on the outlet.** G2S is 478 g
with batteries. Engineering judgement, labelled as such: stake or bracket the
filter/regulator stack independently.

---

## 6. Plumbing-order conflict to resolve

The plan as drawn has **one** Amiad filter and **one** regulator, but **two**
tap-mounted valves. Each valve outlet needs its own stack. Two options:

- **(a) Recommended — buy a second filter + second regulator.** Preserves the ordered
  splitter-first layout exactly, keeps both stacks depressurised between waterings,
  gives true per-zone regulation. Price not yet obtained.
- **(b) One filter/regulator upstream of both valves.** Saves the duplicate but
  leaves everything permanently at mains pressure — a downstream burst runs until
  noticed.

---

## 7. Sensors — three gotchas

- **Battery arrives in HA as VOLTS, not percent.** `soilbatt1..16` → `BATTERY_VOLTAGE`.
  A `battery < 20` alert copied from the generic docs will never fire. Threshold
  ~1.2 V, plus a `last_reported` staleness check.
- **The % is a raw linear index, not volumetric water content**, and needs per-soil
  calibration — the loam border and the compost planter will read differently at the
  same true moisture, so separate thresholds. Raw ADC (`soilad1..`) is also exposed,
  so calibrate as a template sensor in version-controlled YAML rather than in the
  Ecowitt app (which needs an account).
- **WH51 body is IP66, not IP68**; only the probe buries, to a moulded depth mark.
  A border spot that ponds over winter submerges a compartment never rated for it.
  Use **WH51L** (£39, IP68 probe on a 1 m cable) for wet siting.

Two naming traps worth carrying over: GIEX **GX02 is a valve, not a sensor** (the
sensor is **GX04**); and the **QT-07S does not report soil moisture** despite being
sold as a "Soil sensor" — it exposes battery/temperature/humidity where `humidity`
is *"Measured relative humidity"*. SONOFF, SwitchBot and Aqara have no soil moisture
sensor at all.

---

## 8. Automation design — two gaps in the stated goals

- **"Skip after rain" has no data source.** `weather.forecast_home` exists (met.no,
  `supported_features: 3` = daily + hourly, precipitation in mm) but there is **no
  observed rainfall sensor anywhere on the system**. Today only *forecast*-based
  skipping is possible. An Ecowitt **WH40 rain gauge** bolts onto the same GW1200
  already being bought and closes this properly.
- **Valve-failure alerts.** A diaphragm valve below its minimum flow can fail to
  reseat: the controller returns success and **HA reports "closed" while water runs**.
  The Micro Flow Meter is what makes this detectable rather than theoretical.

---

## 9. Winterising

All four manufacturers converge: remove from tap, drain, store indoors, batteries
out. Hozelock is bluntest — *"PROTECT YOUR WATER TIMER FROM FROST. REMOVE FROM THE
TAP IN WINTER. PRODUCT NOT GUARANTEED AGAINST FROST DAMAGE."* Gardena and Orbit both
exclude frost damage from warranty in their own words. LinkTap has anti-freeze
auto-open but still says disconnect and store indoors.

**Valve position on removal is UNVERIFIED across all four** — no manual states it.
Run a manual open cycle before detaching, since a valve stored *closed* traps the
water that cracks the body.

Downstream (Rain Bird): unscrew filters/regulators/backflow preventers and bring
indoors; open end caps and drain several hours; then *"Replace the figure-8 end caps
loosely... Don't tighten these caps completely."*

---

## 10. Open before spending

- [ ] **Outlet thread size is UNVERIFIED for every candidate**, LinkTap included. Confirm with LinkTap.
- [ ] Does the existing outside tap already have an integral double check valve? Physical inspection.
- [ ] Price a second Amiad 120 filter + second 1.4 bar regulator (§6 option a).
- [ ] Source the Type DB pipe interrupter (§4).
- [ ] Water undertaker notification (§4) — legally required, 10 working days.
- [ ] Decide whether to add the WH40 rain gauge now (§8).

## 11. Pi-side prep (nothing done yet)

- [ ] Create a **Garden area** — all 12 existing areas are indoor, and an entity with no area is invisible to `ha-parity`.
- [ ] Install the LinkTap HACS component (HACS is present).
- [ ] Add `ecowitt` via config flow; point the gateway at **port 80**.
- [ ] Label tuning knobs `plumbing` so `./bin/ha-parity` stays quiet.
- [ ] Run `./bin/ha-parity` after onboarding.

## 12. Rejected, with the reason (so it isn't re-litigated)

| Option | Why not |
|---|---|
| LinkTap D1-B | Non-removable 2–50 L/min meters; cannot take the Micro Flow Meter |
| Gardena Dual 19034-20 | v0.2.0 preview integration, "experimental" service shipped disabled, gateway OOS, vertical-only mounting |
| GIEX GX03 (Zigbee) | Z2M issue where valve 2 ON falsely reports valve 1 active; and this house's Z2M mesh has **one** mains router (upstairs landing) — Aqara switches are on Matter, Hue bulbs on the Hue bridge, so **neither can extend Z2M** to the garden |
| Netro Pixie | `cloud_polling` against api.netrohome.com; single outlet |
| RainPoint / Diivoo | Same HomGar cloud platform; integration literally named "RainPoint Cloud"; 433 MHz RF or BLE behind a gateway, not WiFi |
| Hozelock Cloud Controller | Hozelock's own listing: *"will cease to function at the end of April 2027"*. No HA integration ever existed |
| DIY ESPHome + latching valves | ~£130, `Local Push`, ESPHome `sprinkler` supports latching valves natively, and power IS available in the garden — but Rain Bird LFV075 bottoms out at 45.4 L/h, so **Zone 2 is out of spec on this route too** |
