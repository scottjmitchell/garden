> **ARCHIVED EVIDENCE BASE — decisions now live in [`../../irrigation.md`](../../irrigation.md) (2026-09-07).**
> Copied on 2026-09-07 from the (private) Home Assistant repo, where it was still uncommitted.
> House-specific Home Assistant details (network, entity names, device inventory) were removed
> for this public copy; the technical findings are unchanged. This is the primary-source research (manufacturer manuals, HA integration
> manifests, Defra water-fittings guidance, UK retailers) behind the controller, sensor and
> backflow choices. Consult it before re-litigating any device decision. Facts marked
> UNVERIFIED here may have been resolved later — check `irrigation.md` §4 first.

# Smart irrigation: controller + soil sensor selection (research, 2026-09-06)

Greenfield — no prior garden/irrigation work in the Home Assistant repo.

Built from four parallel research passes against primary sources (manufacturer
manuals, HA integration docs/manifests, Zigbee2MQTT converters, the Defra
guidance to the Water Supply (Water Fittings) Regulations 1999, UK retailers).
Every load-bearing claim is quoted verbatim with a URL in the sections below;
anything that could not be sourced is marked UNVERIFIED rather than asserted.

## Verified against the household Home Assistant instance

*Table removed from the public copy. It recorded: the `ecowitt` integration is core, `local_push`, config-flow; the HA HTTP port differs from the default and must be checked before pointing the Ecowitt gateway at it; the weather entity is met.no with daily+hourly precipitation; there is no observed-rainfall sensor; the Zigbee2MQTT mesh has no mains router able to reach the garden; all existing HA areas are indoor, so a Garden area must be created.*


---

# Part 1 — Controllers

# Two-zone tap-mounted irrigation controllers with LOCAL Home Assistant control — UK, September 2026

Research question: which smart tap-mounted irrigation controllers, buyable in the UK as of September 2026,
can run **two drip zones independently** and integrate with **Home Assistant over LOCAL (not cloud) control**?

Application constraints that shape every judgement below:

- Mounts on a Gardena Twin-Tap splitter outlet, 3/4" BSP, outdoors, UK.
- **~100 L/h total across both zones ≈ 1.67 L/min total, ≈ 0.83 L/min per zone.** This is the elimination criterion.
- Downstream: a rigid threaded stack (Amiad 120 mesh filter → 1.4 bar regulator → 16 mm LDPE) hanging off the outlet.
- WiFi preferred (garden AP exists); Zigbee acceptable but the coordinator is far away.
- Battery fine if life is reasonable AND battery % reaches HA.

> **Evidence rule applied throughout:** every capability claim below is a verbatim quote with its URL, or is
> marked **UNVERIFIED**. Where a manual does not mention a feature, this is stated as "manual silent — assume none"
> rather than being read as absence of the feature.

---

## Executive summary

| Rank | Option | ~UK cost | Why |
|---|---|---|---|
| 1 | **2 × LinkTap G2S (TP-2BS) + 2 × Micro Flow Meter (FM20-S-BSP) + 1 × GW-02 Gateway** | **£280** | The mature choice. Genuinely local (manufacturer's own words), two independent zones, mounts in any orientation, and the only option whose flow metering is *specified* to work at Scott's flow rate. |
| 2 | **1 × Gardena smart Dual Water Control (19034-20) + smart Gateway (19005) + `cloudless-garden/ha-gardena-smart-local-preview`** | **~£219** | The one-box choice, and a genuine surprise: GARDENA GmbH themselves publish a **local** HACS integration, `"iot_class": "local_push"`, that explicitly lists the 19034 with Valve + battery entities. Cheaper, tidier, no flow meter to misfire. Discounted to #2 only because the software is v0.2.0 "preview" and the gateway's WebSocket service is "still experimental" and off by default. |
| 3 | **1 × LinkTap D1-B (or T1-B) + GW-02 Gateway** | **£183–£195** | Same proven local stack, one unit, two zones, cheapest LinkTap route — but the built-in flow meters are non-removable and specified at or below Scott's per-zone flow. |

Honourable mention: **2 × Gardena Water Control Bluetooth (Art. 1889) + a Bluetooth proxy, £114** — the only
*core* HA integration in the field and unambiguously local, but two boxes, 25 m BLE range, annual 9V batteries,
and the integration creates only one valve entity per device.

**The single biggest gotcha:** every tap timer that advertises a flow meter has a *minimum measurable flow*,
and at ~0.83 L/min per zone Scott sits underneath almost all of them. LinkTap says so in its own words about
exactly this case — "which is quite possible for a drip irrigation system with only a few emitters" — and the
consequence is not merely a missing number: it is a **false "Water cut-off" alert** on every single watering run,
whose only remedy per LinkTap is to *switch the alert off*. Choosing the D1 (two zones in one box) forfeits the
fix, because the D1's flow meters are non-removable and the low-flow Micro Flow Meter cannot be fitted to it.
Orbit hits the same wall harder still: it warns that drip-rate flows can stop its valve operating at all, and
prescribes *adding emitters*.

---

## Comparison table

| | **LinkTap G2S ×2** | **LinkTap D1-B** | **LinkTap T1-B** | **Gardena smart Dual Water Control 19034** | **Gardena Water Control Bluetooth 1889 ×2** | **GIEX GX03 (Zigbee)** |
|---|---|---|---|---|---|---|
| Model no. | TP-2BS (+ FM20-S-BSP micro flow meter) | D1-B | T1-B (+ V1-2Z ValveLinker) | 19034-20 | 01889-20 | GX03 / `_TZE284_8zizsafo` |
| Zones per unit | 1 (so buy two) | **2 independent** | **2 independent** | **2 independent** | 1 (so buy two) | **2 independent** |
| UK price | £95 ea. + £21 micro FM ea. + £48 gateway = **£280** | £152 + £48 gateway = **£200** (£183 as kit) | £164 + £48 gateway = **£195 as kit** | **£108.99** + gateway (~£110) | **£56.99 ea.** = £113.98 for two | UNVERIFIED (Amazon.co.uk listing exists) |
| UK retailer w/ stock | link-tap.com UK store (GBP, +£14 shipping) | link-tap.com UK store | link-tap.com UK store | easygardenirrigation.co.uk, `"availability": "http://schema.org/InStock"` | easygardenirrigation.co.uk, `"availability": "http://schema.org/InStock"` | Amazon.co.uk B0DZXQGNFV (price UNVERIFIED — Amazon blocks scraping) |
| Protocol | Proprietary Zigbee → GW-02 (Ethernet only) | same | same | 863–870 MHz → Gardena smart Gateway 19005 | Bluetooth LE direct | Zigbee (Tuya) |
| HA route | HACS `sh00t2kill/linktap_local_http_component` | same | same | HACS `cloudless-garden/ha-gardena-smart-local-preview` (**local**) — or `thecem/gardena-smart-system` (cloud) | **Core** `gardena_bluetooth` | Zigbee2MQTT |
| Survives internet outage? | **Yes** — local HTTP API works with no internet, no cloud | Yes | Yes | **Yes via the local integration** (`"iot_class": "local_push"`); **No** via the cloud one | **Yes** — `"iot_class": "local_polling"` | **Yes** |
| Battery | 4× AA, "2 years" | 4× AA, "1.5 years" | 9V / solar / AC, "1.3 years" | 3× AA, "one season" | 1× 9V, "Operating time of the battery (approx.) 1 [year]" | UNVERIFIED |
| Battery % in HA | Yes (`Battery` sensor) | Yes | Yes | **Yes** — "Valve, temperature, battery" per the local integration's device table | Yes (UNVERIFIED which entity) | Yes (`battery`, 0–100 %) |
| IP rating | IP66 | IP66 | IP66 | UNVERIFIED (manual silent) | UNVERIFIED (manual silent) | UNVERIFIED |
| Min flow (valve) | 0.02 MPa min *pressure*; no min flow for the valve | same | same | **20–30 l/h** | **20–30 l/h** | UNVERIFIED |
| Min flow (meter) | **0.2 LPM** with Micro Flow Meter | **1–2 LPM** (LinkTap's own pages disagree), non-removable | **0.7 LPM** | n/a (no flow meter) | n/a | n/a |
| Fits Scott's 0.83 L/min per zone? | **Yes** | **No** | Marginal | Yes (50 l/h per zone > 30 l/h) | Yes | UNVERIFIED |
| Inlet thread | G3/4" adapter (UK "-B" = BSP) | G3/4" (UK "-B") | G3/4" (UK "-B") | G3/4" (26.5 mm) + G1" (33.3 mm) adapters | G3/4" (26.5 mm) + G1" (33.3 mm) | UNVERIFIED |
| Outlet thread | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Mounting orientation | Any — "can be installed horizontally or upside down" | same | same | **Vertical only, union nut up** | **Vertical only, sleeve nut up** | UNVERIFIED |
| Feeding from a splitter | **Explicitly endorsed** ("Use a tap/hose splitter") | same | same | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Weight caveat | 478 g (G2S + batteries) | 0.95 kg with batteries | 0.5 kg (T1 device only) | "Avoid tensile stress." / "Do not pull on the hose while it is connected." | "Avoid tensile strain." | UNVERIFIED |
| Backflow prevention | **Manual silent — assume none** | Manual silent — assume none | Manual silent — assume none | Manual silent — assume none | Manual silent — assume none | Manual silent — assume none |

---

## 1. LinkTap — the most mature local option, and the only one that meters Scott's flow

### 1.1 Is the local control real, or cloud dressed up as local?

Real. LinkTap's own integration manual states it plainly, in a chapter titled "Integrate with HTTP API":

> "When neither Internet access nor MQTT broker is available, third-party application can interact with
> the gateway through HTTP commands."
> — *LinkTap Gateway MQTT Client Integration V2.1*, §4, p.43,
> https://linktap-static.s3.amazonaws.com/manual/LinkTap_Gateway_MQTT_Client_Integration.pdf

The command endpoint is on the gateway itself, not on LinkTap's servers:

> "Third-party application can send commands to the gateway's URL via HTTP POST requests to control the
> end devices. The gateway's URL is http://Your_Gateway_IP_Address/api.shtml."
> — *ibid.*, §4.2, p.44

And LinkTap's FAQ distinguishes the two integration routes and recommends the local one:

> "LinkTap offers various methods for integrating the LinkTap system with third-party systems:
> Cloud-based APIs : Please refer to the API page for details.
> MQTT and Local APIs : Please refer to the documentation for details.
> We recommend using "MQTT and Local APIs" as they have fewer restrictions and enable more responsive
> communication with the LinkTap system."
> — https://link-tap.com/modules/core/views/faq/en/integrate-linktap.client.view.html

Independent corroboration from the openHAB project's official binding documentation:

> "This is for communication over a local area network, that prevents direct access to your gateway /
> openHAB instance from the internet."
> — https://www.openhab.org/addons/bindings/linktap/

**One honest caveat on "local": commissioning is not local.** Pairing the timers, enabling the Local HTTP API on
the gateway's admin page and building the watering plans all happen through the LinkTap account and app. The
integration manual's own opening line to §1 assumes it:

> "By default, the LinkTap Gateway uses DHCP to obtain an IP address from a router or other DHCP servers. After
> the Gateway is connected to the LinkTap server, its current IP address can be seen from the LinkTap App."
> — *LinkTap Gateway MQTT Client Integration V2.1*, §1, p.4

And the HACS integration is explicit that scheduling stays in LinkTap's app:

> "The integration can report LinkTap plan information and can **pause/unpause the existing water plan**, but it
> does not currently provide Home Assistant controls for creating or editing LinkTap watering schedules.
> Use the LinkTap app/web interface to manage schedules."
> — https://github.com/sh00t2kill/linktap_local_http_component

So: **day-to-day control and state are local and survive an outage; setup and schedule editing are not.**

Watering also continues through an outage:

> "For the G1S / G2S / D1 / T1 / Q1 water timers and ValveLinkers, yes, watering will still be carried out
> in accordance with the scheduled watering plan. However, you will not be able to send a new schedule to
> the watering device from your mobile phone or computer if your LinkTap Gateway is offline."
> — https://link-tap.com/modules/core/views/faq/en/electricity-and-internet-down.client.view.html

> "No. The watering device will still shut down the flow at the scheduled time even if there is a blackout
> which causes the Gateway to stop working."
> — https://link-tap.com/modules/core/views/faq/en/power-outage.client.view.html

### 1.2 The Home Assistant integration

**There is no core HA LinkTap integration** — https://www.home-assistant.io/integrations/linktap/ returns HTTP 404
(checked 2026-09-06). The route is HACS: **`sh00t2kill/linktap_local_http_component`**.

Its README, verbatim:

> "A custom Home Assistant integration for LinkTap TapLinkers and ValveLinkers using the LinkTap gateway's
> **local HTTP API**."

> "The LinkTap gateway's **Local HTTP API must be enabled** and the gateway must be reachable directly from
> Home Assistant on the local network."

> "A Home Assistant **device** is created for each LinkTap output discovered through the gateway.
> For multi-valve TapLinkers or ValveLinkers, a separate Home Assistant device is created for each output."

— https://github.com/sh00t2kill/linktap_local_http_component (README.md, master)

That last quote is what answers "does one unit do two zones independently in HA": **yes**, a D1 or T1 appears
as two separate HA devices, each with its own switch and valve entity.

Battery reaches HA. From the same README's sensor table:

> "| **Battery** | Device battery level |"

and the alert binary sensors:

> "| **Is Leaking** | Leak condition reported by the device |
> | **Is Clogged** | Clogged condition reported by the device |"

Flow reaches HA as a proper statistics-capable sensor:

> "Since **v0.8.0**, the **Speed** sensor exposes Home Assistant's proper `volume_flow_rate` device class and
> `measurement` state class, using canonical units: `L/min`, `gal/min`"

Two caveats worth knowing before committing:

> "The `valve.start_watering` entity service accepts its own duration in seconds and currently sends that
> request directly to the LinkTap API. It does not use the Watering Duration / Watering Volume number helpers,
> so do not assume the optional helper safety ceilings apply to that service call."

> "Since **v0.8.2**, the integration protects against a LinkTap local-API behaviour where sending another
> positive pause request while a plan is already paused can deactivate the underlying watering plan even
> though the gateway reports a successful response."

And a hard architectural limit from the openHAB docs — only one local API consumer at a time:

> "The gateway supports 1 Local HTTP API, for an ideal behavior the Gateway should be able to connect to
> openHAB on a HTTP port by its IP, and only a single openHAB instance should be connected to a Gateway."
> — https://www.openhab.org/addons/bindings/linktap/

### 1.3 The flow-meter trap (the biggest gotcha in this whole report)

LinkTap's FAQ describes Scott's exact scenario and its consequence:

> "The measurement range of the flow meter is 2 - 50 LPM (or 0.52 - 13.2 GPM) for the G2S, D1 and G2 water
> timers, 2 - 150 LPM (or 0.52 - 40 GPM) for the one-inch LinkTap flow meter. If the actual flow rate is
> less than 1 LPM or 0.26 GPM (which is quite possible for a drip irrigation system with only a few emitters),
> the flow meter will not be able to detect the flow. ... If that is the case, please disable the "water
> cut-off alert" through the app to stop the system from sending the false alert. If the issue is due to low
> flow, you might consider using the LinkTap Micro Flow Meter."
> — https://link-tap.com/modules/core/views/faq/en/flow-meter-zero-reading.client.view.html

The Micro Flow Meter is the fix, and its range covers Scott:

> "Designed to complement the LinkTap G2S and G2 water timers, the LinkTap Micro Flow Meter is engineered to
> measure low water flow rates, ranging from 0.2 to 5 LPM (or 0.05 ~ 1.3 GPM), with a measurement error of
> +/- 5%. In comparison, the G2S and G2's default flow meter covers flow rates from 2 to 50 LPM
> (or 0.5 ~ 13.2 GPM)."

> "If your irrigation system consumes between 0.2 and 1 LPM (or 0.05 and 0.26 GPM), you can then use the
> LinkTap Micro Flow Meter in place of the G2S or G2's original flow meter to measure the flow accurately."

— https://link-tap.com/modules/core/views/micro-flow-meter.client.view.html

**But it cannot be fitted to the two-zone D1:**

> "The LinkTap D1 water timer has two built-in, non-removable flow meters. This means that you cannot use the
> LinkTap Micro Flow Meter with the D1 water timer. The Micro Flow Meter is designed for use with the LinkTap
> G2S and G2 water timers, which have removable flow meters."
> — *ibid.*

**LinkTap's own pages contradict each other on the D1's lower limit.** The older D1 comparison page says:

> "Flow meter measurement range | 2 - 50 LPM | 0.52 - 13.2 GPM"
> — https://link-tap.com/modules/core/views/d1-water-timer.client.view.html

The newer two-zone page says:

> "Flow Measurement Range | 1 - 50 LPM / 0.26 - 13.2 GPM | 0.7 - 40 LPM / 0.18 - 10.6 GPM"
> (D1 and T1 respectively)
> — https://link-tap.com/modules/core/views/dual-zone-water-timer.client.view.html

Either way, at **0.83 L/min per zone** the D1 is below its own floor, and the T1 at 0.7 LPM is only just above it.
Treat the T1 as marginal, not safe.

Note the valve itself has no minimum *flow* — only a minimum *pressure*:

> "The LinkTap water timer uses a DC latching solenoid valve that requires a minimum water pressure of
> 0.02 MPa (or 2.9 psi) to work."
> — https://link-tap.com/modules/core/views/faq/en/water-butt.client.view.html

So a D1 would still **water** correctly at Scott's flow. It just would not **measure**, and would cry wolf.

### 1.4 Mounting, splitter, orientation, weight

Orientation is unconstrained — a real advantage over Gardena:

> "Yes. With an IP66 waterproof design, the G1S / G2S / D1 / T1 / Q1 can be installed horizontally or upside
> down. Please note that all water timer products are directional. When installing the LinkTap water timer,
> make sure that water enters from the inlet of the water timer. Also, avoid placing the water timer directly
> on the ground, submerged in water, used in damp pits or buried."
> — https://link-tap.com/modules/core/views/faq/en/install-water-timer-horizontally.client.view.html

Feeding from a splitter is explicitly endorsed, and Gardena's own splitter is named:

> "Use a tap/hose splitter. There are many models of 2-way and 4-way tap splitters in hardware store, Amazon
> and eBay. If you are in the EU/UK/AU and want to attach 4 LinkTap water timers on one tap splitter, Gardena
> Four Channel Water Distributor is our recommendation. It is available from Bunnings (Australia) and Amazon
> (EU, UK). Please note that the Gardena Four Channel Water Distributor uses BSP thread..."
> — https://link-tap.com/modules/core/views/faq/en/attach-multiple-LinkTap-water-timers.client.view.html

Downstream of a Gardena water distributor is also explicitly supported:

> "Yes! In this application, the LinkTap water timer will be connected between your tap and the Gardena water
> distributor."
> — https://link-tap.com/modules/core/views/faq/en/used-with-Gardena-Automatic-Water-Distributor.client.view.html

Flow restriction through the valve:

> "Yes. All valve products (including the LinkTap water timers) will inevitably reduce the flow throughput to
> some extent due to their internal conduit structure. In the case of LinkTap water timers, the flow reduction
> is approximately 5-8%..."
> — https://link-tap.com/modules/core/views/faq/en/reduce-flow.client.view.html

Weights, for judging a rigid stack hanging off the outlet:

> "The total weight of the G2S water timer and 4 AA alkaline batteries: 478 grams."
> — https://link-tap.com/modules/core/views/spec.client.view.html

> "Weight | 0.95 kg or 2.1 lb (with batteries) | 0.5 kg or 1.1 lb (T1 device only)" (D1 / T1)
> — https://link-tap.com/modules/core/views/dual-zone-water-timer.client.view.html

**LinkTap publishes no weight/support caveat for downstream loads. UNVERIFIED — there is no manufacturer
statement either permitting or prohibiting a rigid threaded assembly hanging off the outlet.** Contrast with
Gardena, which does say "Avoid tensile strain" (see §2).

**Physical fitment warning for the two-G2S plan.** The flow meter is an in-line section at the bottom of the
body, which is why the G2S is 5.8 cm taller than the otherwise-identical G1S:

> "The dimensions of the G2S & G2 water timers: 10.0 cm x 7.1 cm x 16.3 cm.
> The dimensions of the G1S & G1 water timer: 10.0 cm x 7.1 cm x 10.5 cm."
> — https://link-tap.com/modules/core/views/spec.client.view.html

The Micro Flow Meter replaces that section — "Step 1: Remove the LinkTap G2S or G2's original flow meter.
Step 2: Attach the Micro Flow Meter." (https://link-tap.com/modules/core/views/micro-flow-meter.client.view.html) —
so Scott's stack becomes tap → Twin-Tap → G2S body → micro flow meter → Amiad filter → regulator → LDPE, on each
of two legs. Two bodies at 10.0 cm wide hanging off one Twin-Tap is 20 cm of side-by-side width before the
downstream stacks are counted. **Measure the Twin-Tap outlet spacing before ordering.** The one-box D1/T1 avoids
this problem entirely, which is the real argument for them.

### 1.5 Backflow prevention

**Manual silent — assume none.** LinkTap's site contains no mention of "backflow", "check valve" or
"anti-siphon" as a built-in feature. The only reference to backflow treats it as something that may already
exist *on the tap*, i.e. external to the timer:

> "If water leaks at Point A when you first start using the device, please check if a backflow preventer has
> been pre-installed on your tap. If so, the backflow preventer may interfere with the wire mesh gasket
> located in the water timer inlet collar."
> — https://link-tap.com/modules/core/views/faq/en/fix-water-leaks.client.view.html

That same FAQ confirms the UK inlet thread and a UK-specific fitting quirk worth knowing:

> "In some countries (mainly the UK and EU), some taps have short threaded outlets, which may not be able to
> firmly press the washer, causing water leakage at Point A. If that's the case, place the spare washer
> supplied in the package into the G3/4" tap adapter so that 2 stacked washers will stop leakage."
> — *ibid.*

### 1.6 Specs and UK pricing

Core specs:

> "Operating water pressure range: 0.02-0.8 Mpa (3-116 psi)
> Water flow rate: >32 LPM @ 0.8 Mpa (116 psi)
> Water timer power: 4 AA alkaline or lithium batteries
> Wireless technology: Zigbee
> Wireless operating spectrum: 2.4GHz ISM
> Number of TapLinkers & ValveLinkers per Gateway: 15
> Waterproof rating for water timer: IP66"
> — https://link-tap.com/modules/core/views/taplinker-spec.client.view.html

Note "**Number of TapLinkers & ValveLinkers per Gateway: 15**" — one GW-02 drives both units in the two-G2S plan.

D1 vs G2S, verbatim from LinkTap's comparison table:

> "One D1 ≈ Two G2S
> # of zones | 1 | 2
> # of AA batteries (not included) | 4 | 4
> Battery life | 2 years | 1.5 years
> Wireless protocol | Proprietary Zigbee | Proprietary Zigbee
> # of devices per Gateway | 15 | 15
> # of watering cycles per day | 100 | 50 per zone
> ... IP66 waterproof ..."
> — https://link-tap.com/modules/core/views/d1-water-timer.client.view.html

**The gateway is Ethernet-only** — relevant given Scott's garden AP is WiFi:

> "No. There is no Wi-Fi module in the LinkTap Gateway, so it cannot connect to a device via Wi-Fi signals.
> The LinkTap Gateway must be hardwired to a router, Wi-Fi extender, power network adapter, or network switch
> via an Ethernet cable."
> — https://link-tap.com/modules/core/views/faq/en/connect-gateway-via-wifi.client.view.html

The gateway is also specified as an indoor device:

> "The LinkTap Gateway is designed for private use in an indoor environment to control the LinkTap's Wireless
> Water Timer."
> — https://link-tap.com/modules/core/views/spec.client.view.html

**UK prices (GBP, ex. shipping), read directly out of LinkTap's own storefront bundle** — the block guarded by
`"UK"===$scope.displayCountry.countrySaved`, with `currency="GBP"`, in
https://www.link-tap.com/dist/application.min.js (rendered at https://www.link-tap.com/#!/buy):

| SKU (UK model) | Product title from the same bundle | UK price |
|---|---|---|
| TP-2BS | "LinkTap G2S Wireless Water Timer & Flow Meter" | **£95** (`g2sAddonPrice=95`) |
| GW-02 + TP-2BS | "LinkTap Gateway & G2S Wireless Water Timer & Flow Meter" | **£129** (`g2sKitPrice=129`) |
| FM20-S-BSP | "LinkTap Micro Flow Meter, Compatible with G2S and G2" | **£21** (`mfmPrice=21`) |
| D1-B | "LinkTap D1 2-Zone Wireless Water Timer (with two built-in flow meters)" | **£152** (`d1AddonPrice=152`) |
| GW-02 + D1-B | "LinkTap Gateway & D1 2-Zone Wireless Water Timer (with two built-in flow meters)" | **£183** (`d1KitPrice=183`) |
| V1-2Z + T1-B | "LinkTap T1 2-Zone Wireless Water Timer (with 2 built-in flow meters)" | **£164** (`t1AddonPrice=164`) |
| GW-02 + V1-2Z + T1-B | "LinkTap Gateway & T1 2-Zone Wireless Water Timer (with 2 built-in flow meters)" | **£195** (`t1KitPrice=195`) |
| GW-02 | "LinkTap Gateway" | **£48** (`gwPrice=48`) |
| V1-2Z | "LinkTap 2-Zone ValveLinker" | **£145** (`v1_2zPrice=145`) |

Shipping surcharge in the same UK block: `surcharge=14`. The UK model suffix is **-B** (BSP thread); the US/CA
models are **-N** (NPT/GHT), per the model codes printed on the buy page.

**Note on the user's "ST-1":** no such LinkTap model exists. LinkTap's current line-up is **G1S, G2S, D1, T1, Q1**
(tap-mounted) plus the **ValveLinker V1-1Z / V1-2Z / V1-4Z** (wired to external solenoids). "ST-1" appears in no
LinkTap source found.

---

## 2. Gardena

### 2.1 GARDENA smart Water Control (19031) / smart Dual Water Control (19034) — **two HA routes, one of them local**

The 19034 is the natural two-zone competitor: one box, two independently programmable valves, £108.99 in the UK.
The received wisdom is that Gardena means cloud. **That is no longer true**, and this is the most consequential
finding in the report after the flow-meter trap.

The product does what is wanted, mechanically:

> "The smart Dual Water Control has two separately controllable valves. This allows two different garden areas
> to be irrigated automatically and independently of each other. Each connection can be programmed individually."
> — *GARDENA Operator's manual, smart Water Control / smart Dual Water Control*, 19033-20.962.02, p.8,
> https://content.tdr.dss.husqvarnagroup.net/pub000105589/doc000263062

Technical data, verbatim from that manual (p.22):

> "Number of valves | 1 | 2
> Operating temperature range (outdoors) | 5 – 50 °C | 5 – 50 °C
> Min. / max. operating pressure | 0.5 / 12 bar | 0.5 / 12 bar
> Flow medium | clear fresh water | clear fresh water
> Max. media temperature | 40 °C | 40 °C
> Batteries required | 3x alkaline batteries type LR6 (AA) Mignon | 3x alkaline batteries type LR6 (AA) Mignon
> Battery life | one season | one season"
> (columns are Art. No. 19033 and Art. No. 19034 respectively)

Minimum flow — **Scott clears this one**:

> "The minimum water delivery rate for a safe switching function of the water control is 20 – 30 l/h
> (For example, for drip irrigation systems there should be at least 10 – 15 x 2 litre drip heads)."
> — *ibid.*, §1.1.3, p.6

At ~50 l/h per zone Scott is above the 20–30 l/h floor. Good.

Mounting orientation — **Scott does not clear this one**:

> "The Water Control must only be installed vertically and with the union nut facing upwards to prevent water
> from entering the battery compartment."
> — *ibid.*, §1.1.3, p.6

Weight / rigid-stack caveat:

> "Avoid tensile stress."
> "Do not pull on the hose while it is connected."
> — *ibid.*, §1.1.3, p.6

Threads:

> "1. For 26.5 mm (G 3/4") threads: Screw the adapter !5 onto the Water Control by hand
> 2. For 21.0 mm (G 1/2") threads: Screw the adapter !6 into the adapter !5 by hand"
> — *ibid.*, §2.3.1, p.12

The smart functions require the gateway:

> "To make the most of all the functions and benefits, the Water Control can be expanded using the smart
> Gateway (Art. No. 19005). The GARDENA smart App is then used for operation."
> — *ibid.*, §2.1 "DuoConnect", p.8

> "GARDENA Gateway | For using the smart functions of the Water Control. | Art. No. 19005"
> — *ibid.*, §8 Accessories, p.23

#### Route A — `cloudless-garden/ha-gardena-smart-local-preview` — **LOCAL, and written by GARDENA**

This is in the HACS default list (confirmed: `https://raw.githubusercontent.com/hacs/default/master/integration`
contains `"cloudless-garden/ha-gardena-smart-local-preview"`), it is actively maintained (last push 2026-09-03,
40★, created 2026-02-26), and its source files carry a **GARDENA copyright header**:

> `SPDX-FileCopyrightText: 2026 GARDENA GmbH`
> `SPDX-License-Identifier: Apache-2.0`
> — https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/README.md

The manifest is unambiguous:

> `"domain": "gardena_smart_local_preview"`, `"name": "GARDENA smart local (preview)"`,
> `"iot_class": "local_push"`, `"requirements": ["gardena-smart-local-api==0.1.3"]`, `"version": "0.2.0"`,
> `"zeroconf": ["_gardena-smart._tcp.local."]`
> — https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/custom_components/gardena_smart_local_preview/manifest.json

The README states the local claim directly:

> "Home Assistant integration for GARDENA smart devices using local communication (not going through the cloud)."

> "## Features
> - Local communication with GARDENA smart devices
> - Real-time updates via WebSocket"

**And the 19034 is explicitly on the supported list, with battery:**

> "| GARDENA smart Dual Water Control | 19034-20 | Valve, temperature, battery |"

(The neighbouring rows list 19031-20 as "Valve, temperature, battery, RF link quality" and 19033-20 as
"Valve, temperature, battery".) — all from
https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/README.md

The underlying library repeats the claim and — crucially — states that the gateway's cloud connector can simply
be **switched off**:

> "Enables controlling and monitoring GARDENA smart devices in the local network, without going through the cloud."

> "Cloudadapter is not needed for local usage and disabling the service saves resources. However, for
> reverse-engineering how the services react to actions in the app, keeping the cloudadapter running and
> increasing its verbosity is helpful."
> — both https://raw.githubusercontent.com/cloudless-garden/gardena-smart-local-api/main/README.md
> (`SPDX-FileCopyrightText: 2026 GARDENA GmbH`, LGPL-3.0-or-later)

**The catches, quoted rather than glossed:**

> "The still experimental WebSocket service running on the gateway is disabled by default.
> You can enable it through the gateway's web interface by visiting e.g.: https://GARDENA-123456.local"

> "The password is the first block of the gateway ID printed on the back of the device, e.g.:
> ID: `1234abcd-996c-48f7-83dc-d2d1bac08e7e` → password: `1234abcd`"

> "The advanced options are hidden behind a tiny grey arrow at the bottom of the page."

> "⚠️ Installing a firmware update on a Gen1 device factory-resets its settings. Schedules and other
> configuration will be lost and need to be set up again afterwards. This does not affect Gen2 devices."

> "The temperature sensor integrated into Water Control devices is intended solely for frost detection, not for
> precise real-time temperature tracking."
> — all https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/README.md

The 19034 is a **2nd-gen** device per the library's own table ("smart Dual Water Control | 19034-20 | 2814 |
2nd gen"), so the Gen1 firmware-reset warning does not apply to it.

**Assessment:** this is a real, current, manufacturer-authored local path, and it is the reason the Gardena
Dual is a serious contender rather than an also-ran. But it is version **0.2.0**, labelled "preview", riding a
gateway service its own author calls "still experimental" and ships disabled. That is a materially less proven
footing than LinkTap's local HTTP API, which has shipped in a documented manual since 2022 and supports two
independent third-party implementations (HA and openHAB).

#### Route B — `thecem/gardena-smart-system` — cloud

There is no core Gardena smart-system integration (https://www.home-assistant.io/integrations/gardena/
and .../gardena_smart_system/ both return HTTP 404, checked 2026-09-06). The older HACS route is
`thecem/gardena-smart-system`, whose README makes the cloud dependency explicit in its setup steps:

> "You need a Gardena Smart System account and API credentials:
> 1. Go to [Gardena Developer Portal](https://developer.husqvarnagroup.cloud/)
> 2. Create an account and register your application
> 3. Note your **Client ID** and **Client Secret**"

> "- **🔐 OAuth2 Authentication**: Secure API connection with improved token management"
> — https://github.com/thecem/gardena-smart-system (README.md, main)

**Explicit statement of the cloud dependency for this route:** the integration authenticates by OAuth2 against
`developer.husqvarnagroup.cloud` and talks to the Husqvarna GARDENA smart system API. An internet outage removes
HA control. (The README contains no sentence saying "this will not work offline" — that inference rests on the
OAuth2/cloud-portal quotes above, so treat the *mechanism* as verbatim-sourced and the *consequence* as reasoning
from it.) **Route A above supersedes this for Scott's purposes.**

#### UK price and stock (verified 2026-09-06)

Easy Garden Irrigation lists "Gardena Smart Dual Water Control - 19034", SKU `G19034-20`, at `"price": 108.99`
with `"availability": "http://schema.org/InStock"` —
https://www.easygardenirrigation.co.uk/products/gardena-smart-dual-water-control

The same retailer's "Gardena Smart Gateway" page shows `"price": 109.99` but
**`"availability": "http://schema.org/OutOfStock"`** —
https://www.easygardenirrigation.co.uk/products/gardena-smart-gateway
**So the gateway needs sourcing elsewhere; check stock before committing to this route.** Gardena also sells
bundled "Set" SKUs (gateway + control) which may be easier to obtain than the bare 19005 — UNVERIFIED.

**Backflow prevention: manual silent — assume none.** The operator's manual contains no occurrence of
"backflow", "non-return" or "check valve".

### 2.2 GARDENA Water Control Bluetooth (Art. 1889) — **genuinely local, but one zone**

This is the only *core* Home Assistant integration in the whole field, and Home Assistant's own manifest
declares it local:

> `"iot_class": "local_polling"`
> — https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/gardena_bluetooth/manifest.json

The docs name the exact supported model:

> "Water control
> Water Control Bluetooth ( 01889-20 )
> Soil Moisture Sensors ( 1867-20 )"

> "Limitations
> Control of offline scheduling settings is not supported.
> Use of the official Android application, sometimes locks out access to device until factory reset is
> performed or Bluetooth is disabled in the Android device."

> "Gardena devices remember previously paired Bluetooth adapters, up to 10, and only allow connections from
> those adapters. If you replace your adapter or use multiple Bluetooth proxies, the device must be paired
> with that proxy or adapter before it will connect. Otherwise, the device silently ignores the connection
> attempt. In Home Assistant, this usually appears as timeout errors."
> — https://www.home-assistant.io/integrations/gardena_bluetooth/

**One valve per device in HA.** The integration's `valve.py` constructs at most a single `GardenaBluetoothValve`
per config entry:

```python
    entities = []
    if GardenaBluetoothValve.characteristics.issubset(coordinator.characteristics):
        entities.append(GardenaBluetoothValve(coordinator))
```
— https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/gardena_bluetooth/valve.py

So even if a two-valve Gardena BLE unit were paired, this integration would surface one valve. **Two zones here
means two physical 1889 units on a splitter.**

Manufacturer specs, verbatim from the official operator's manual
(https://content.tdr.dss.husqvarnagroup.net/pub000081261/doc000148926):

> "The Water Control may only be set up vertically with the sleeve nut to the top to prevent water penetrating
> into the battery compartment."

> "The minimum water output to ensure that the Water Control functions correctly is 20 – 30 l/h. For example,
> at least 10 x 2-litre Drip Heads are required to control the Micro-Drip-System."

> "The max. temperature for the water flow is 40 °C.
> Avoid tensile strain."

> "8. TECHNICAL DATA — Water Control Bluetooth® | Unit | Value (Art. 1889)
> Operation temperature range (outdoors) | °C | 5 – 50
> SRD Frequency range | GHz | 2,402 – 2,480
> Free field radio range (approx.) | m | 25
> Min. / max. operating pressure | bar | 0,5 / 12
> Flow medium | Clear fresh water
> Battery required | 1 x 9 V alkaline manganese Typ IEC 6LR61
> Operating time of the battery (approx.) | a | 1"

> "1. For a tap with a G 3/4" (26.5 mm) thread: Screw the adaptor (8) onto the tap manually"

Practical blockers for Scott: **"Free field radio range (approx.) | m | 25"** means an ESPHome Bluetooth proxy in
the garden is mandatory; the vertical-only mounting rule conflicts with hanging a rigid filter/regulator stack;
and two units are needed, doubling the 9V battery churn.

**Backflow prevention: manual silent — assume none.**

**UK price and stock (verified):** Easy Garden Irrigation lists "Gardena Bluetooth Water Timer - 1889" at
`"price": 56.99` with `"availability": "http://schema.org/InStock"` —
https://www.easygardenirrigation.co.uk/products/gardena-bluetooth-water-timer-1889

So **two units = £113.98**, plus an ESP32 Bluetooth proxy in the garden (~£15–25) to bridge the 25 m radio range.
That is the cheapest genuinely-local two-zone path in this report — but it is two boxes on the splitter, both
constrained to vertical mounting, both on annual 9V batteries.

---

## 3. Zigbee / Tuya — GIEX GX03 (the cheap two-zone option)

Zigbee2MQTT supports a genuine two-zone tap timer, and it exposes exactly the entities wanted:

> "| Model | GX03 |
> | Vendor | GIEX |
> | Description | GIEX 2-zone watering timer |
> | Exposes | valve_1, state_1, timer_1, countdown_1, last_duration_1, valve_2, state_2, timer_2, countdown_2, last_duration_2, battery |"
> — https://raw.githubusercontent.com/Koenkk/zigbee2mqtt.io/master/docs/devices/GX03.md
> (rendered: https://www.zigbee2mqtt.io/devices/GX03.html)

Both valves are independently writable:

> "### Valve 1 (binary)
> State of the valve 1. ... To write (`/set`) a value publish a message to topic
> `zigbee2mqtt/FRIENDLY_NAME/set` with payload `{"valve_1": NEW_VALUE}`."

> "### Valve 2 (binary)
> State of the valve 2. ... To write (`/set`) a value publish a message to topic
> `zigbee2mqtt/FRIENDLY_NAME/set` with payload `{"valve_2": NEW_VALUE}`."

Battery does reach HA, with a caveat:

> "### Battery (numeric)
> Remaining battery in %, can take up to 24 hours before reported.
> Value can be found in the published state on the `battery` property. ... The unit of this value is `%`."

— all *ibid.*

Zigbee2MQTT is local by definition; its own device-page boilerplate says so:

> "Integrate your GIEX GX03 via Zigbee2MQTT with whatever smart home infrastructure you are using without the
> vendor's bridge or gateway."
> — *ibid.* (front-matter `description`)

### Known reliability complaints in the Z2M issue tracker

Two, and both are serious for a two-zone application:

> "Unexpected Valve Activation Behavior in GIEX GX03 Water Controller … Valve 2, however, behaves unexpectedly.
> When turning Valve 2 on, Valve 1 appears to activate as well, according to the UI and Zigbee command feedback.
> Reproducibility: The issue occurs consistently across multiple attempts. … While the UI and Zigbee commands
> indicate both Valve 1 and Valve 2 are active when Valve 2 is turned on, only Valve 2 actually allows water
> flow in reality. To enable water flow through Valve 1, it must first be switched off and then turned back on
> again."
> — https://github.com/Koenkk/zigbee2mqtt/issues/27273 (closed, opened 2025-05-01)

> "GX03 (_TZE284_8zizsafo): incoming /set via friendly_name topic silently ignored, IEEE address topic works …
> publishing a `/set` command to the topic based on the device's **friendly_name** is silently ignored
> (no reaction, no log output whatsoever, even with full debug logging enabled). The exact same payload
> published to the topic based on the device's **IEEE address** works correctly and switches the valve as
> expected."
> — https://github.com/Koenkk/zigbee2mqtt/issues/32606 (**open**, opened 2026-07-19)

The first is exactly the "two zones independently" failure mode this whole exercise is about. It is marked
closed, but nothing in the thread confirms a firmware or converter fix landed — treat as unresolved risk.

### What could not be verified for the GX03

**UNVERIFIED:** UK price and stock (Amazon.co.uk listing B0DZXQGNFV exists —
https://www.amazon.co.uk/2-Zone-Watering-Irrigation-Controller-Compatible/dp/B0DZXQGNFV — but Amazon blocks
automated retrieval, so the price is not quoted here). **UNVERIFIED:** IP rating, minimum and maximum flow rate,
inlet/outlet thread sizes, battery type and claimed life, mounting orientation, splitter guidance, weight caveats.
GIEX publishes no manufacturer datasheet or manual I could reach from a primary source.
**Backflow prevention: no manual located — assume none.**

### Other Zigbee water valves checked and rejected

| Z2M device | Why not |
|---|---|
| `GIEX GX02` / `QT06_1` / `QT06_2` | Single zone. Exposes `battery, state, mode, ... water_consumed, irrigation_target`. |
| `Tuya TS0601_water_switch` ("Dual water valve") | Two valves but exposes only `valve_status, switch (state), countdown, valve_duration, battery` — no per-valve independent write documented. |
| `Tuya TS0601_water_valve` | "Ultrasonic water meter valve", an inline meter, not a tap timer. |
| `Tuya TS0601_water_valve_1` | Single `switch (state), position, position_current`. No battery. |
| `Saswell SEA801/SEA802-Zigbee` | Not an irrigation valve — "Thermostatic radiator valve". |

Sources: the corresponding `docs/devices/*.md` files under
https://github.com/Koenkk/zigbee2mqtt.io/tree/master/docs/devices

**Note on the coordinator distance problem:** a battery-powered Zigbee valve is an end device and cannot route,
so the mains-powered repeater is not optional. The GX03's Zigbee radio also brings no Tuya cloud dependency once
paired to Z2M — that part is genuinely fine.

---

## 4. Orbit B-hyve, Hozelock, Netro Pixie, RainPoint, Diivoo, and the DIY baseline

### 4.0 Core Home Assistant integration status — checked directly, 2026-09-06

`https://www.home-assistant.io/integrations/<domain>/` HTTP status:

| Domain | Status | Meaning |
|---|---|---|
| `linktap` | **404** | no core integration (HACS only) |
| `gardena` / `gardena_smart_system` | **404** | no core integration (HACS only) |
| `gardena_bluetooth` | **200** | **core integration exists**, `"iot_class": "local_polling"` |
| `hozelock` | **404** | none |
| `claber` | **404** | none |
| `netro` | **404** | none |
| `rainpoint` | **404** | none |
| `bhyve` / `b_hyve` / `orbit` | **404** | none |
| `localtuya` | **404** | none (LocalTuya is HACS-only) |
| `tuya` | **200** | exists, but `"iot_class": "cloud_push"` |

The Tuya line matters for every RainPoint / Diivoo / GIEX **WiFi** timer: the only *core* route to them is the
Tuya integration, and Home Assistant's own manifest classifies it as cloud:

> `"iot_class": "cloud_push"`
> — https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/tuya/manifest.json

Contrast with the one local option in the field:

> `"iot_class": "local_polling"`
> — https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/gardena_bluetooth/manifest.json

A GitHub repository search for `claber+home-assistant` and `hozelock+home-assistant` returned **zero
repositories** (GitHub search API, 2026-09-06). **Hozelock and Claber therefore have no Home Assistant
integration of any kind — core or HACS — and are eliminated on that basis alone**, regardless of their hardware.
This matters because Claber does sell a two-zone tap timer in the UK (AquaDue Duplo 8410, stocked at
easygardenirrigation.co.uk) and several Bluetooth models (Hydro-4 BT 90840, Elettra BT 90843, Controller 4 BT
90842) — attractive hardware with no path into HA.

### 4.1 Orbit B-hyve — a genuine local route exists, but the hardware is wrong for drip

> **Provenance note.** The research pass that produced this section retracted several UK retail figures as
> fabricated. Those have been deleted. The load-bearing technical quotes below — Orbit's flow rate, its backflow
> answer, its battery spec, the 24632 two-outlet product and the drip-kit counterpoint — were **re-fetched and
> confirmed independently on 2026-09-06** before being kept. Anything not re-confirmed is marked UNVERIFIED.

**Two HACS integrations exist, and they differ on exactly the axis that matters.** Both are in the HACS default
list (`https://raw.githubusercontent.com/hacs/default/master/integration`).

| | `sebr/bhyve-home-assistant` (328★) | `ljmerza/orbit-bhyve-ble` (12★) |
|---|---|---|
| `iot_class` | **`"cloud_push"`** | **`"local_polling"`** |
| Transport | `wss://api.orbitbhyve.com/v1/events` | BLE direct to the valve |
| Cloud needed | continuously | at setup only |

> `"iot_class": "cloud_push"`
> — https://raw.githubusercontent.com/sebr/bhyve-home-assistant/master/custom_components/bhyve/manifest.json

> `"iot_class": "local_polling"`
> — https://raw.githubusercontent.com/ljmerza/orbit-bhyve-ble/main/custom_components/orbit_bhyve/manifest.json

Home Assistant's developer docs define what `cloud_push` means:

> "cloud_push: Integration of this device happens via the cloud and requires an active internet connection.
> Home Assistant will be notified as soon as a new state is available."
> — https://developers.home-assistant.io/docs/creating_integration_manifest/

The BLE integration states its local claim in its own words:

> "**Local BLE control for Orbit B-Hyve hose-tap and XD timers.** Cloud is contacted only at setup to discover
> devices and fetch network keys. After setup, every command and state poll is BLE-only — your timers keep
> working when the WAN goes down."

> "**Battery (%)** sensor — live, BLE-sourced. Decoded from the device's info-ack frame on every poll, no cloud
> round-trip after setup."

…and immediately undercuts itself with a warning that should give any long-term buyer pause:

> "⚠️ **Do NOT update your B-Hyve device firmware.** This integration was reverse-engineered against the
> firmware versions above. A firmware update may change the encryption protocol or trailer algorithm. If the
> official B-Hyve app prompts you to update, decline."
> — all three: https://github.com/ljmerza/orbit-bhyve-ble

The cloud integration's README is **silent** on outage behaviour — it never uses the words cloud, internet,
offline or outage about itself. The cloud dependency is established from the manifest and the source: `available`
returns `self.device_data.get("is_connected", False)`, and the coordinator raises `UpdateFailed` on
`(BHyveError, TimeoutError)` — so **every entity goes unavailable during a WAN outage**. Supporting constants:

> `API_HOST = "https://api.orbitbhyve.com"` / `WS_HOST = "wss://api.orbitbhyve.com/v1/events"` / `API_POLL_PERIOD = 300`
> — https://raw.githubusercontent.com/sebr/bhyve-home-assistant/master/custom_components/bhyve/pybhyve/const.py

> "The Wifi hub is required to provide the faucet timer with internet connectivity. Bluetooth connectivity with
> the timer is not supported."
> — https://github.com/sebr/bhyve-home-assistant (README)

Battery does reach HA on the cloud route too:

> "- `sensor` for battery levels, zone watering history, device next watering time, device run-mode state,
> flood-sensor temperature and flood-sensor signal strength."
> — *ibid.*

**But Orbit's hardware is the wrong shape for a 1.7 L/min drip system, and Orbit says so.** Flow spec:

> "What is the flow rate of hose timers? 2.5-9 GPM"
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab

2.5 GPM ≈ 9.5 L/min — roughly **5.5× Scott's total flow**. Orbit's support pages then name drip systems as a
failure mode and prescribe the exact opposite of what Scott needs:

> "only use water pressure between 5 and 100 PSI. Water pressure below 5 PSI can cause the valve not to open or
> close properly. This is common with drip systems, gravity feed systems, rain barrels, etc."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Leaking-Between-Faucet-Connection-and-Timer-d321

> "If you have a drip system connected to the Hose Timer, remove a dripper and run the hose timer manually for a
> few seconds, and then turn it off. The removed dripper will allow more water to flow through the line and
> relieve some of the pack pressure on the Hose Timer's valve. If that works, you'll need to add more emitters
> to the line in order for it to work with the B-hyve Device."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/How-To-Get-water-to-flow-from-your-hose-faucet-valve-ea3

This is a diaphragm-valve back-pressure limitation, and "add more emitters" is not a fix Scott can apply.
In fairness, Orbit does sell a drip kit, so this is a caution rather than an absolute bar:

> "The B-hyve Smart Shrub & Flower Bed Drip Kit is a high-quality and easy-to-install low-pressure drip system
> which eliminates hand watering or overhead sprinkler watering."
> — SKU 69536, $159.99, https://www.orbitonline.com/products/b-hyve-smart-shrub-flower-bed-drip-kit
> *(independently re-fetched and confirmed, 2026-09-06)*

**Backflow prevention: answered definitively, and the answer is no.** This is the only manufacturer in the whole
report that states it outright rather than staying silent:

> "Do hose timers have a backflow preventer? – Hose End Timers do not have a backflow preventer. You would need
> to install an Anti-siphon Valve on the hose end."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab

**Threads are wrong for a BSP garden:**

> "Currently, all B-hyve and Orbit branded Hose Faucet Timers use a ¾ inch GHT/NPT thread size."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/What-size-threads-do-Orbit-B-hyve-products-use-a69

**And there is no UK retail channel.** Orbit does not ship here:

> "We ship only within the 48 contiguous United States, Alaska, Hawaii, and U.S. territories."
> — https://www.orbitonline.com/policies/shipping-policy

Easy Garden Irrigation was checked directly and returns **"0 results found for "b-hyve""**.

> **UK price and stock: UNVERIFIED — do not act on any figure.** Amazon.co.uk, Screwfix, B&Q, Toolstation and
> Robert Dyas either blocked automated retrieval (Robert Dyas returned HTTP 403) or were not parsed for results.
> An earlier draft of this section carried specific UK prices; the research pass that produced them retracted
> them as fabricated, and they have been removed. Any UK price for B-hyve must be checked by hand before
> purchase.

The genuine one-unit-two-zone product is the **B-hyve XD 2-Outlet**, confirmed on Orbit's own storefront:

> "B-hyve XD 2-Outlet Bluetooth Hose Faucet Sprinkler Timer | 24632", SKU 24632, $69.99,
> "in stock, ready to be shipped"
> — https://www.orbitonline.com/products/orbit-24632

A 4-outlet XD (24634) also exists; Orbit's KB refers to the "2 port B-hyve XD" and "4 port B-hyve XD".

Battery, other specs:

> "What type of batteries do our hose timers need? – Battery-operated timers require 2 X 1.5 v Batteries, and
> we recommend using Alkaline batteries."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab
> *(independently re-fetched and confirmed, 2026-09-06)*

> "These should be replaced at least once a year."
> — https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/How-To-Get-water-to-flow-from-your-hose-faucet-valve-ea3

> "Pressure Operating Range: 10-100 PSI" / "For Outdoor Use With Cold Water Only" / "Do not place the timer in
> an underground valve box."
> — https://cdn.shopify.com/s/files/1/0489/2445/9176/files/HT25_Quick_Start_Guide.pdf

The WiFi hub is indoor-only, like LinkTap's gateway:

> "For Indoor Use Only" / "Range: 300 (91 m) without interference"
> — https://cdn.shopify.com/s/files/1/0489/2445/9176/files/21027-24_rA_11.pdf

**UNVERIFIED for Orbit:** IP rating (no IP code appears in any of the 21004, HT25, XD, 21006 or 21027 manuals);
minimum flow as a distinct spec (the "2.5-9 GPM" figure does not say whether it is a requirement or a rated
throughput); mounting orientation; splitter guidance; and any weight/support caveat for a rigid downstream
assembly — the only placement guidance in any manual is the valve-box line quoted above.

**Verdict: eliminated on UK availability and BSP threads, with the drip-flow warning as a second independent
reason.** Worth remembering that a local BLE route to B-hyve exists, if the hardware situation ever changes.

### 4.2 Hozelock — eliminated outright, and it is worse than "no integration"

**Hozelock is discontinuing the service.** From Hozelock Ltd's own App Store listing — **independently
re-fetched and confirmed on 2026-09-06** via `https://itunes.apple.com/lookup?id=1069335122&country=gb`,
which returns `sellerName: "Hozelock Ltd"`, `version: 2.03.00`, released 2025-05-19, with these `releaseNotes`:

> "Added popup notification of service ending / Dear user, / We would like to inform you that the CLOUD
> CONTROLLER watering controller from Hozelock will cease to function at the end of April 2027."
> — Hozelock Ltd, https://apps.apple.com/gb/app/hozelock/id1069335122
> (also in `releaseNotes` at https://itunes.apple.com/lookup?id=1069335122&country=gb)

The product has already left the catalogue: `https://www.hozelock.com/product/cloud-controller/` redirects to the
homepage, and Hozelock's 258-product sitemap contains no cloud/smart/wifi controller — the current controller
range (AC Water Timer Plus, Mechanical, Select, Select Plus, Sensor, Sensor Controller Plus) mentions no Wi-Fi,
Bluetooth, app or hub.

**Control was cloud-only by design**, and Hozelock said so:

> "The Hozelock Cloud Controller is linked via a Hub which is connected directly to an internet router with an
> Ethernet cable" / "Each Hub is capable of supporting up to 4 remote taps" / "The Hub links wirelessly with a
> remote tap unit in your garden that can be positioned up to 50 metres away"

> "System requires a working internet connection, Ethernet port and compatible smart phone."

> "If for any reason your internet connection fails, the garden will still get watered, as the schedules are
> stored locally on the Cloud Controller remote tap unit."
> — all three: https://apps.apple.com/gb/app/hozelock/id1069335122

Note the last quote carefully: schedules survive an outage, but **HA control does not** — the hub's only
correspondent is `hoz3.com`.

**There is no Home Assistant integration and there never has been.** GitHub returns exactly three `hozelock`
repositories worldwide, none an HA integration; `hozelock+home+assistant` → 0 repos; `hozelock filename:manifest.json`
code search → 0 results; HACS default list → 0 hits. One unaffiliated research project
(https://github.com/frak/hoz3-unlocked, created Aug 2026, 0 stars, no licence, self-described as not yet working
end-to-end) is attempting a local replacement server with HA MQTT discovery. Treat its claims as third-party,
not manufacturer:

> "Hozelock will shut the Cloud Controller service down at the end of **April 2027**. The hub talks only to
> `hoz3.com`, so without a replacement the watering stops. The tap controller's radio link is proprietary and
> not replaceable"

> "Cleartext HTTP on port 80, no auth, no TLS." / "Control is via **Home Assistant over MQTT discovery**… The
> Hozelock phone app is not supported and dies with the service."
> — https://github.com/frak/hoz3-unlocked

Specs from the official 2216 instruction booklet
(https://www.hozelock.com/download/2216-cloud-controller-instruction-booklet-uk/):

> "Operating Pressure 0.1 – 10 Bar" / "Max. Water Temperature 30°C" / "Battery Type 2x AA 1.5v Lithium/Alkaline
> Batteries" / "Mounting Method Surface mounting"

> "Replace batteries each season."

> "A ½ inch BSP and a ¾ inch BSP thread adaptor are supplied." / "B 26.5mm G¾ (¾"bsp)"

> "SPECTRUM (Art. 3(2)): EN 300 220-2 V2.4.1 :2012"

(That last line identifies a sub-GHz SRD link — a proprietary 868 MHz-class radio, not Wi-Fi or Zigbee.)

**The 2216 manual is silent on flow rate, IP rating and backflow prevention — assume no backflow preventer.**

**Verdict: eliminated.** The BSP threads are right and the price would have been right, but a cloud service with
a published death date and no HA integration is not a candidate.

### 4.3 Netro Pixie and RainPoint — both cloud, verified from their own manifests

Both have HACS-default integrations, and both declare themselves cloud. I fetched these manifests directly.

**Netro** — `kcofoni/ha-netro-watering` (in the HACS default list):

> `"domain": "netro_watering"`, `"name": "Netro Watering"`, **`"iot_class": "cloud_polling"`**,
> `"requirements": ["pynetro==0.1.5", "validators==0.20.0"]`, `"version": "1.4.2"`
> — https://raw.githubusercontent.com/kcofoni/ha-netro-watering/main/custom_components/netro_watering/manifest.json

**RainPoint** — `funkadelic/ha-rainpoint` (in the HACS default list). The integration is *named* "RainPoint
Cloud", which settles the question without interpretation:

> `"domain": "rainpoint"`, **`"name": "RainPoint Cloud"`**, `"integration_type": "service"`,
> **`"iot_class": "cloud_push"`**, `"requirements": ["paho-mqtt==2.1.0"]`, `"version": "1.22.0"`
> — https://raw.githubusercontent.com/funkadelic/ha-rainpoint/main/custom_components/rainpoint/manifest.json

Home Assistant's own definition of what those classes mean:

> "cloud_push: Integration of this device happens via the cloud and requires an active internet connection."
> — https://developers.home-assistant.io/docs/creating_integration_manifest/

**Both are therefore eliminated on the hard requirement (local control), regardless of their hardware specs.**
Netro's "Public API" is a cloud endpoint, not a device-local one. Neither has a core HA integration
(`/integrations/netro/` and `/integrations/rainpoint/` both return HTTP 404).

### 4.4 Tuya WiFi water timers (Diivoo, RainPoint WiFi, GIEX WiFi) — treat as cloud

The only *core* route to a Tuya WiFi device is the Tuya integration, and Home Assistant classifies it as cloud:

> `"iot_class": "cloud_push"`
> — https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/tuya/manifest.json

LocalTuya (`rospogrigio/localtuya`, in the HACS default list) can drive some Tuya WiFi devices locally, but it
requires extracting a per-device local key from Tuya's cloud, and it breaks whenever a device's firmware moves
to a protocol version it does not implement. **For a device that must reliably open and close a water valve
unattended, that is not a foundation to build on.** Plainly stated: **a Tuya WiFi water timer cannot be
considered locally controllable in the way a LinkTap gateway or a Gardena local WebSocket can.** The Zigbee
Tuya variants (§3) are a different matter — once paired to Zigbee2MQTT they carry no cloud dependency at all.

### 4.5 The DIY baseline — ESPHome driving 9V DC latching solenoids

**Comparison baseline only, not a recommendation.** But it is a strong baseline, because ESPHome has a
first-class `sprinkler` component that already knows about latching valves — this is not a bodge.

> "Support for both latching ("pulsed") and non-latching valves (which can be arbitrarily mixed!)"
> — https://esphome.io/components/sprinkler/

> "This is the switch component to be used to control the valve that operates the given section or zone of the
> sprinkler system. Typically this would be a GPIO switch wired to control a relay or other switching device
> which in turn would activate the respective valve. **For latching valves, use an H-Bridge switch.**"
> — *ibid.*

There is a complete worked example in the docs, "Single Controller, Three Latching Valves, Single Latching Pump":

> "This example is similar to the previous example, however it illustrates how a "latching" or "pulsed" valve can
> be configured using H-Bridge switches. This type of valve requires two GPIO pins to operate — one to switch
> the valve on and another to switch the valve off. Note that, while this example illustrates a configuration
> that uses exclusively latching valves, latching and non-latching valves may be mixed and matched in any
> configuration, even if attached to a common pump/upstream valve."
> — *ibid.*

The component also covers the failure mode that matters most for an unattended garden valve — it tells you not
to expose the raw GPIO switches to the front end (see "An Important Note about GPIO Switches and Control" in the
same page), and it offers `pump_start_valve_delay` / `pump_stop_pump_delay` sequencing for valves that "require
sufficient water pressure to (fully/quickly) close".

**The valves, from a UK supplier, verified.** Betavalve (High Wycombe) stocks 3/4" BSP female 9V latching
solenoids — RPE "Seconda" series, made in Italy:

> "3/4" BSP female, irrigation solenoid valve, latching, 9V dc" — Stock Code: `6202NB 9V`,
> "Our Price (Ex VAT): £45.29", "Call or email for availability"

> "2 way Bistable (latching) solenoid valve, designed for water control, ideal for battery powered irrigation
> use."

> "Pressure range: 0.5-10 bar" / "Voltage: 9V DC latching"

> "The operating pressure range of 0.5 – 10 bar (7 – 145 psi) allows them to be used on mains water pressure,
> providing a cost effective and low power consumption solution to the task of automatic water control."

> "Minimum order quantities apply to this product. Please contact our sales office on 01494 459 511 for further
> information."
> — all https://www.betavalve.com/Product-Detail?prodref=6202NB+9V
> (a 2-way variant, `6207NB 9V`, is listed at the same £45.29 ex VAT with identical specs —
> https://www.betavalve.com/Product-Detail?prodref=6207NB+9V)

**Minimum operating pressure is 0.5 bar**, same as Gardena — and since the valve sits *upstream* of Scott's
1.4 bar regulator, it sees mains pressure and clears this comfortably. **There is no minimum flow spec at all**,
which is the whole point.

**Rough bill of materials:** 2 × solenoid at £45.29 ex VAT = **£90.58 ex VAT / ~£109 inc**, plus an ESP32 board,
an H-bridge driver per valve, an IP-rated enclosure and a power source. **Those remaining component costs are
UNVERIFIED** — the research pass covering them did not report back before this document was finalised, so no
figure is quoted. On the valves alone the DIY route is already within sight of the £219 Gardena and below the
£280 LinkTap, before any enclosure, board or labour. **It does not save money.**

**What it demands:** you own the watertightness, the battery/PSU, the freeze behaviour, the fail-safe when the
ESP reboots mid-cycle, and the enclosure. Against a £280 LinkTap or a £219 Gardena, the saving is not the point —
the point is that this is the only route with **no minimum measurable flow problem at all**, because there is no
flow meter and a latching solenoid's only requirement is enough pressure to shift the armature. If Scott ever
finds that both commercial routes misbehave at 0.83 L/min per zone, this is the fallback that structurally
cannot.

---

## 5. Recommendation

### Primary: 2 × LinkTap G2S (TP-2BS) + 2 × Micro Flow Meter (FM20-S-BSP) + 1 × GW-02 Gateway — **£280 + £14 shipping**

Rationale, each leg of which is quoted above:

1. Its local control is stated by the manufacturer in the words *"When neither Internet access nor MQTT broker
   is available…"* rather than inferred, and is corroborated by two independent third-party implementations
   (Home Assistant and openHAB) against a manual that has documented the API since 2022.
2. It is the only option whose flow metering is *specified* to work at Scott's flow rate
   (Micro Flow Meter, 0.2–5 LPM, against 0.83 L/min per zone).
3. Mounting orientation is unconstrained, which the rigid downstream stack needs, and LinkTap explicitly
   endorses feeding timers from a tap splitter — naming a Gardena distributor as its own recommendation.
4. One GW-02 drives both units ("Number of TapLinkers & ValveLinkers per Gateway: 15"), and the HACS
   integration gives each output its own HA device with a switch, a valve, a battery sensor and leak/clog
   binary sensors.

**Accept these costs:** ~£100 more than the D1 route and ~£60 more than the Gardena route; two boxes on the
splitter rather than one; the gateway is Ethernet-only and indoor-rated, so it needs a wired drop (a WiFi
extender with an RJ45 port satisfies LinkTap's own wording); only one local-API consumer may talk to the gateway
at a time; and commissioning/schedule editing still go through LinkTap's app and account.

### Strong alternative if one box matters more than flow metering: Gardena smart Dual Water Control 19034 + smart Gateway 19005 + `ha-gardena-smart-local-preview` — **~£219**

Pick this if the two G2S bodies will not fit side by side on the Twin-Tap, or if volume measurement is not
wanted. It gives two independent zones in a single unit, local push into HA, battery and valve entities, and a
minimum flow spec (20–30 l/h) that Scott comfortably clears. **Accept:** software at v0.2.0 marked "preview",
riding a gateway WebSocket service its own author calls "still experimental" and ships disabled; vertical-only
mounting ("must only be installed vertically and with the union nut facing upwards"); "Avoid tensile stress";
no flow measurement at all; and the gateway showed **OutOfStock** at the one UK retailer checked.

### Open items to resolve before ordering — all genuinely unanswered

1. **Outlet thread size is UNVERIFIED for every LinkTap model.** No LinkTap page states it. Confirm with
   support@link-tap.com that the outlet accepts the Amiad filter / 1.4 bar regulator stack, or plan an adapter.
   (Gardena at least publishes its inlet adapters: G3/4" 26.5 mm and G1/2" 21.0 mm.)
2. **No manufacturer in this report gives guidance on hanging a rigid threaded assembly off the outlet.**
   LinkTap is silent; Gardena says only "Avoid tensile stress" and "Do not pull on the hose while it is
   connected." The mechanical question is unanswered either way — support the filter/regulator stack
   independently rather than letting it hang on the timer's outlet.
3. **Measure the Twin-Tap outlet spacing** against two 10.0 cm-wide G2S bodies before choosing the two-unit
   route.
4. **Fit a separate backflow preventer regardless of choice.** Not one controller in this field documents
   built-in backflow prevention. Orbit is the only manufacturer that answers the question at all, and its
   answer is "Hose End Timers do not have a backflow preventer. You would need to install an Anti-siphon Valve
   on the hose end." Every other manual is silent, which is not evidence of presence.
5. **Check the Gardena smart Gateway's UK stock** if taking the alternative route.

---

## Appendix — the decisive verbatim quotes, collected

Every quote below appears in context above. This is the short list a purchase decision actually turns on.

### Local vs cloud

| # | Quote | Source |
|---|---|---|
| Q1 | "When neither Internet access nor MQTT broker is available, third-party application can interact with the gateway through HTTP commands." | LinkTap Gateway MQTT Client Integration V2.1, §4 p.43 — https://linktap-static.s3.amazonaws.com/manual/LinkTap_Gateway_MQTT_Client_Integration.pdf |
| Q2 | "Third-party application can send commands to the gateway's URL via HTTP POST requests to control the end devices. The gateway's URL is http://Your_Gateway_IP_Address/api.shtml." | *ibid.*, §4.2 p.44 |
| Q3 | "A custom Home Assistant integration for LinkTap TapLinkers and ValveLinkers using the LinkTap gateway's **local HTTP API**." | https://github.com/sh00t2kill/linktap_local_http_component |
| Q4 | "This is for communication over a local area network, that prevents direct access to your gateway / openHAB instance from the internet." | https://www.openhab.org/addons/bindings/linktap/ |
| Q5 | "Home Assistant integration for GARDENA smart devices using local communication (not going through the cloud)." | https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/README.md |
| Q6 | `"iot_class": "local_push"` | https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/custom_components/gardena_smart_local_preview/manifest.json |
| Q7 | "Cloudadapter is not needed for local usage and disabling the service saves resources." | https://raw.githubusercontent.com/cloudless-garden/gardena-smart-local-api/main/README.md |
| Q8 | `"iot_class": "local_polling"` (Gardena Bluetooth, HA core) | https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/gardena_bluetooth/manifest.json |
| Q9 | `"iot_class": "cloud_push"` (B-hyve, `sebr`) | https://raw.githubusercontent.com/sebr/bhyve-home-assistant/master/custom_components/bhyve/manifest.json |
| Q10 | `"iot_class": "local_polling"` (B-hyve BLE, `ljmerza`) | https://raw.githubusercontent.com/ljmerza/orbit-bhyve-ble/main/custom_components/orbit_bhyve/manifest.json |
| Q11 | `"name": "RainPoint Cloud"`, `"iot_class": "cloud_push"` | https://raw.githubusercontent.com/funkadelic/ha-rainpoint/main/custom_components/rainpoint/manifest.json |
| Q12 | `"iot_class": "cloud_polling"` (Netro) | https://raw.githubusercontent.com/kcofoni/ha-netro-watering/main/custom_components/netro_watering/manifest.json |
| Q13 | `"iot_class": "cloud_push"` (Tuya, HA core) | https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/tuya/manifest.json |
| Q14 | "cloud_push: Integration of this device happens via the cloud and requires an active internet connection." | https://developers.home-assistant.io/docs/creating_integration_manifest/ |

### Minimum flow — the elimination criterion

| # | Quote | Source |
|---|---|---|
| Q15 | "If the actual flow rate is less than 1 LPM or 0.26 GPM (which is quite possible for a drip irrigation system with only a few emitters), the flow meter will not be able to detect the flow. … please disable the "water cut-off alert" through the app to stop the system from sending the false alert." | https://link-tap.com/modules/core/views/faq/en/flow-meter-zero-reading.client.view.html |
| Q16 | "the LinkTap Micro Flow Meter is engineered to measure low water flow rates, ranging from 0.2 to 5 LPM (or 0.05 ~ 1.3 GPM), with a measurement error of +/- 5%." | https://link-tap.com/modules/core/views/micro-flow-meter.client.view.html |
| Q17 | "The LinkTap D1 water timer has two built-in, non-removable flow meters. This means that you cannot use the LinkTap Micro Flow Meter with the D1 water timer." | *ibid.* |
| Q18 | "The minimum water delivery rate for a safe switching function of the water control is 20 – 30 l/h (For example, for drip irrigation systems there should be at least 10 – 15 x 2 litre drip heads)." | GARDENA Operator's manual 19033/19034, §1.1.3 p.6 — https://content.tdr.dss.husqvarnagroup.net/pub000105589/doc000263062 |
| Q19 | "The minimum water output to ensure that the Water Control functions correctly is 20 – 30 l/h." | GARDENA Water Control Bluetooth manual (Art. 1889) — https://content.tdr.dss.husqvarnagroup.net/pub000081261/doc000148926 |
| Q20 | "What is the flow rate of hose timers? 2.5-9 GPM" | https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab |
| Q21 | "Water pressure below 5 PSI can cause the valve not to open or close properly. This is common with drip systems, gravity feed systems, rain barrels, etc." | https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Leaking-Between-Faucet-Connection-and-Timer-d321 |
| Q22 | "you'll need to add more emitters to the line in order for it to work with the B-hyve Device." | https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/How-To-Get-water-to-flow-from-your-hose-faucet-valve-ea3 |
| Q23 | "The LinkTap water timer uses a DC latching solenoid valve that requires a minimum water pressure of 0.02 MPa (or 2.9 psi) to work." | https://link-tap.com/modules/core/views/faq/en/water-butt.client.view.html |

### Mounting, splitter and mechanical load

| # | Quote | Source |
|---|---|---|
| Q24 | "Yes. With an IP66 waterproof design, the G1S / G2S / D1 / T1 / Q1 can be installed horizontally or upside down. … make sure that water enters from the inlet of the water timer." | https://link-tap.com/modules/core/views/faq/en/install-water-timer-horizontally.client.view.html |
| Q25 | "Use a tap/hose splitter. There are many models of 2-way and 4-way tap splitters … Gardena Four Channel Water Distributor is our recommendation." | https://link-tap.com/modules/core/views/faq/en/attach-multiple-LinkTap-water-timers.client.view.html |
| Q26 | "The Water Control must only be installed vertically and with the union nut facing upwards to prevent water from entering the battery compartment." | GARDENA manual 19033/19034 §1.1.3 p.6 |
| Q27 | "Avoid tensile stress." / "Do not pull on the hose while it is connected." | *ibid.* |
| Q28 | "The Water Control may only be set up vertically with the sleeve nut to the top…" / "Avoid tensile strain." | GARDENA Water Control Bluetooth manual (Art. 1889) |
| Q29 | "Do not place the timer in an underground valve box." | https://cdn.shopify.com/s/files/1/0489/2445/9176/files/HT25_Quick_Start_Guide.pdf |

### Backflow prevention

| # | Quote | Source |
|---|---|---|
| Q30 | "Do hose timers have a backflow preventer? – Hose End Timers do not have a backflow preventer. You would need to install an Anti-siphon Valve on the hose end." | https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab |
| Q31 | LinkTap: **manual silent — assume none.** Only reference treats a backflow preventer as external: "please check if a backflow preventer has been pre-installed on your tap." | https://link-tap.com/modules/core/views/faq/en/fix-water-leaks.client.view.html |
| Q32 | Gardena 19031/19033/19034 and 1889: **manuals silent — assume none.** No occurrence of "backflow", "non-return" or "check valve". | manuals cited above |
| Q33 | Hozelock 2216, GIEX GX03: **manual silent / no manual located — assume none.** | — |

### Two zones from one unit

| # | Quote | Source |
|---|---|---|
| Q34 | "The smart Dual Water Control has two separately controllable valves. This allows two different garden areas to be irrigated automatically and independently of each other. Each connection can be programmed individually." | GARDENA manual 19033/19034 p.8 |
| Q35 | "For multi-valve TapLinkers or ValveLinkers, a separate Home Assistant device is created for each output." | https://github.com/sh00t2kill/linktap_local_http_component |
| Q36 | "\| GARDENA smart Dual Water Control \| 19034-20 \| Valve, temperature, battery \|" | https://raw.githubusercontent.com/cloudless-garden/ha-gardena-smart-local-preview/main/README.md |
| Q37 | "\| Exposes \| valve_1, state_1, timer_1, countdown_1, last_duration_1, valve_2, state_2, timer_2, countdown_2, last_duration_2, battery \|" (GIEX GX03) | https://raw.githubusercontent.com/Koenkk/zigbee2mqtt.io/master/docs/devices/GX03.md |
| Q38 | "B-hyve XD 2-Outlet Bluetooth Hose Faucet Sprinkler Timer \| 24632", SKU 24632, $69.99, "in stock, ready to be shipped" | https://www.orbitonline.com/products/orbit-24632 |
| Q39 | Single valve entity per device in HA core Gardena Bluetooth: `entities.append(GardenaBluetoothValve(coordinator))` — only ever one | https://raw.githubusercontent.com/home-assistant/core/dev/homeassistant/components/gardena_bluetooth/valve.py |

### Product end-of-life

| # | Quote | Source |
|---|---|---|
| Q40 | "We would like to inform you that the CLOUD CONTROLLER watering controller from Hozelock will cease to function at the end of April 2027." | Hozelock Ltd, https://itunes.apple.com/lookup?id=1069335122&country=gb (`releaseNotes`, v2.03.00) |

---

## What could not be verified

Listed plainly so nothing here reads as more certain than it is.

1. **Outlet thread size — every candidate.** No manufacturer states it. LinkTap's inlet is a `G3/4"` adapter and
   the UK SKUs carry a `-B` (BSP) suffix; Gardena publishes G3/4"/G1"/G1/2" *inlet* adapters. Outlets: UNVERIFIED
   across the board. This is the single most important open item for a rigid downstream stack.
2. **Weight/support guidance for a rigid threaded assembly on the outlet — every candidate.** LinkTap and Orbit
   are silent; Gardena's "Avoid tensile stress" is the closest anyone comes, and it is about hoses.
3. **LinkTap's own two pages disagree on the D1 flow-meter floor** (2–50 LPM vs 1–50 LPM). Neither has been
   reconciled by LinkTap.
4. **IP rating for Orbit and Hozelock.** No IP code in any manual retrieved (Orbit 21004, HT25, XD, 21006, 21027;
   Hozelock 2216).
5. **GIEX GX03 physical specs entirely** — IP rating, min/max flow, threads, battery type and life, mounting,
   splitter guidance, UK price. GIEX publishes no reachable datasheet.
6. **UK price and stock for Orbit B-hyve.** An earlier draft carried figures that the research pass producing
   them retracted as fabricated; they were removed. Amazon.co.uk and several UK DIY retailers block automated
   retrieval. Any B-hyve UK price must be checked by hand.
7. **Gardena Water Control Bluetooth (1889) — HA entity names.** Battery is reported, but which entity and with
   what precision is UNVERIFIED.
8. **Netro Pixie, Diivoo — hardware specs.** Both are eliminated on the cloud test before hardware matters
   (Netro verified from its manifest; Diivoo is Tuya-based). Their flow rates, threads, IP ratings and backflow
   status were not pursued.
9. **DIY baseline: the ESP32 board, H-bridge driver and enclosure costs.** The ESPHome latching-valve capability
   is verified, and the solenoids are verified (Betavalve `6202NB 9V`, 3/4" BSP female, £45.29 ex VAT,
   0.5–10 bar). The rest of the bill of materials is not, and Betavalve notes "Minimum order quantities apply"
   and "Call or email for availability".
10. **Whether the Gardena smart Gateway (19005) is currently obtainable in the UK.** The one retailer checked
    shows OutOfStock.

---

# Part 2 — Soil moisture sensors

# Soil Moisture Sensors for Permanent UK Outdoor Installation + Home Assistant

Research date: **2026-09-06**. Two sensors needed: one border (bushes / small fruit trees / flowers), one raised planter (herbs & veg). Both drive irrigation automations, so silent failure, drift and corrosion are real risks.

**Sourcing rule applied:** every capability claim below is quoted verbatim from a manufacturer manual, a Home Assistant docs page, Home Assistant / Zigbee2MQTT source code, a Zigbee2MQTT device page, a GitHub issue, or a UK retailer listing. Anything I could not source primarily is marked **UNVERIFIED**. Blog round-ups and AI-generated "best of 2026" listicles (smarthomeexplorer.com, zigbeehubs.com blog, smarthomecompared.com) surfaced in searches and were **excluded** from all capability claims.

---

## 1. Headline recommendation

| Rank | Pick | Why |
|---|---|---|
| **1** | **Ecowitt WH51** × 2 + **Ecowitt GW1200** (or GW3000) gateway | Only candidate where every requirement is verifiable from primary sources: core HA integration, `Local Push`, no cloud account required, FR-4 (non-metallic) capacitive/FDR probe, IP66, 12-month AA, 16 sensors per gateway, and the **raw ADC is exposed to HA** so you can calibrate in HA rather than trusting a vendor curve. |
| **2** | **Tuya / GIEX Zigbee soil sensor** (`TS0601_soil`, `TS0601_soil_2`, `GX04`) via Zigbee2MQTT | Genuinely local, exposes a proper `soil_moisture` attribute, reuses your existing Zigbee mesh — but battery reporting is demonstrably broken across variants and the probe technology is not documented by any manufacturer. Acceptable as the *second* sensor, not as the pair. |

**Do not buy:** Mi Flora / Flower Care (discontinued, BLE range, known outdoor failures), SwitchBot or Aqara (neither sells a soil moisture sensor), Tuya QT-07S (does not expose soil moisture at all — see §5).

---

## 2. Comparison table

| | **Ecowitt WH51** | **Ecowitt WH52** (3-in-1) | **Tuya `TS0601_soil` / GIEX `GX04`** | **Tuya `QT-07S`** | **Mi Flora HHCCJCY01** | **DIY ESPHome capacitive** |
|---|---|---|---|---|---|---|
| **Exact model** | WH51 (868 MHz EU) | WH52 / WH52A | `TS0601_soil`, `TS0601_soil_2`, `TS0601_soil_3`, GIEX `GX04` | `QT-07S` | HHCCJCY01 | e.g. "Capacitive Soil Moisture Sensor v1.2" + ESP32 |
| **UK price / retailer / stock** | **£21.00**, Weather Spares, `available: true` (verified via product JSON 2026-09-06) | **£32.00**, Weather Spares, `available: true` | ~£13–20 AliExpress; UK stock inconsistent | n/a | **Discontinued** | ~£15–25 parts |
| **Sensing technology** | Manual §5: **"Frequency Domain Reflectometry"**; manual §3.1: **"Advanced Capacitive Sensing"** (see §6 — the manual contradicts itself, but both are non-resistive) | Moisture: as WH51. **EC: "Dual-electrode measurement"** → exposed electrodes | **UNVERIFIED** — no manufacturer datasheet found | **UNVERIFIED** | Capacitive (**UNVERIFIED** — no live Xiaomi spec page) | Capacitive (by construction) |
| **Probe material** | **"FR-4(Glass Fiber Reinforced Epoxy)"** — no exposed metal | Moisture probe as WH51; EC electrodes exposed | **UNVERIFIED** | **UNVERIFIED** | **UNVERIFIED** | Exposed PCB unless conformal-coated |
| **Protocol** | 868 MHz sub-GHz → Wi-Fi/Ethernet gateway | 868 MHz → gateway | Zigbee 3.0 | Zigbee 3.0 | Bluetooth LE | Wi-Fi |
| **HA integration** | **Core `ecowitt`**, `ha_iot_class: Local Push` | Core `ecowitt` (verified in `aioecowitt`, not in docs list) | Zigbee2MQTT / ZHA | Zigbee2MQTT | Core `xiaomi_ble`, `Local Push` | ESPHome |
| **Cloud-free?** | **Yes** — web UI at `192.168.4.1`, "no account required" | Yes | Yes | Yes | Yes | Yes |
| **Battery** | **1 × AA**, **"Minimum 12 months"** | 1 × AA (**UNVERIFIED** life) | 2 × AAA (`TS0601_soil_3`) | **UNVERIFIED** | CR2032, ~1 yr (**UNVERIFIED**) | Li-ion / USB |
| **Battery % in HA?** | **NO — volts, not percent.** `soilbatt1..16` → `BATTERY_VOLTAGE` | Same (volts) | **Yes (%), but demonstrably wrong** — see §7 | Yes (%) | Yes, but "only once a day" and needs a connection | Whatever you code |
| **IP rating** | **IP66** ("Device's body and sensor") | **"CIP66-rated for outdoor use"** [sic] | **UNVERIFIED** | **UNVERIFIED** | **UNVERIFIED** | None inherent |
| **Buriable?** | **NO — partial only.** "bury the probe up to the indicated depth mark on its body" | Same | **UNVERIFIED** | **UNVERIFIED** | Body must stay above soil | Design-dependent |
| **Working temp** | **−10 °C to 50 °C** | **UNVERIFIED** | **UNVERIFIED** | **UNVERIFIED** | **UNVERIFIED** | Component-dependent |
| **Reading units** | **0–100 %**, ±5 %, 1 % resolution — a **derived linear index**, not volumetric water content | % + °C + µS/cm | `%` (`soil_moisture`) | **No soil moisture at all** | % | Whatever you calibrate |
| **Per-soil calibration needed?** | **Yes.** "In general, the sensor need to be calibrated to suit your soil type." | Yes | Not documented | n/a | Not documented | Yes, mandatory |
| **Sensors per gateway** | **16** | 16 (**shared** with WH51/WH51L) | Zigbee mesh limit | — | — | — |

---

## 3. Ecowitt WH51 + gateway — the detail

### 3.1 Is the HA integration native/core, and is it fully local?

**Yes to both.** From the integration's own docs frontmatter:

> ```
> title: Ecowitt
> ha_release: 2022.9
> ha_iot_class: Local Push
> ha_domain: ecowitt
> ha_config_flow: true
> ha_integration_type: device
> ```
> — https://github.com/home-assistant/home-assistant.io/blob/current/source/_integrations/ecowitt.markdown

It is in `home-assistant/core` (domain `ecowitt`, codeowner `@pvizeli`) — a core integration, not HACS.

**The gateway pushes to HA; HA never polls the cloud:**

> "The **Ecowitt** integration works by first creating a callback endpoint on your Home Assistant instance and then adding this configuration to the Ecowitt console so that it starts sending data."
> — https://www.home-assistant.io/integrations/ecowitt/

**No Ecowitt cloud account is required** — the docs give an explicit account-free path:

> "- **Ecowitt mobile app** (requires creating an Ecowitt account)
>  - **Embedded web interface** by connecting to the device's Wi-Fi hotspot and opening `192.168.4.1` in a browser (no account required)"
> — https://www.home-assistant.io/integrations/ecowitt/

Configuration is done entirely on-LAN:

> "**Option 2**: Navigate to the Ecowitt web UI in a browser at the station IP address:
> 1. Select **Weather Services** then scroll down to the **Customized** section.
> 2. Under **Customized**, select 🔘 Enable and **Protocol Type Same As** 🔘 Ecowitt.
> 3. Enter the Server IP / Host Name, Path, and Port from the integration."
> — https://www.home-assistant.io/integrations/ecowitt/

### 3.2 ⚠️ One real constraint: no HTTPS

> "Your Home Assistant instance is accessible via HTTP. Ecowitt devices do not support HTTPS connections. If your instance only accepts HTTPS, refer to [TLS/SSL limitations]."
> — https://www.home-assistant.io/integrations/ecowitt/

**Relevance here:** benign if the HA instance serves plain HTTP on the port the gateway is pointed at; otherwise a reverse proxy or port change is needed.

### 3.3 ⚠️ GW1100 is NOT in the supported-devices list

The brief asked about GW1100 / GW2000 / GW3000. The HA docs list:

> "### Gateway/Hub
> - GW1200 Wi-Fi Gateway
> - GW2000 Ethernet and Wi-Fi Gateway
> - GW3000 Ethernet and Wi-Fi Gateway with Data Storage"
> — https://www.home-assistant.io/integrations/ecowitt/

**GW1100 is absent.** It is also absent from Weather Spares' current Ecowitt collection (checked via `products.json`, 2026-09-06) — it appears to be superseded by the GW1200. The Ecowitt manual still lists GW1100 as WH51-compatible, so it likely works, but **buy a GW1200/GW3000** to stay on the documented path.

And the sensor is explicitly listed:

> "### Sensors
> - WH51 Wireless Soil Moisture Sensor"
> — https://www.home-assistant.io/integrations/ecowitt/

### 3.4 Battery life, battery type, IP rating

From the official WH51 manual, §5 Specification (https://oss.ecowitt.net/uploads/20251226/WH51Manual.pdf):

> | Material of Housing | ABS+PC |
> | Material of Probe | FR-4(Glass Fiber Reinforced Epoxy) |
> | Measurement Principle | Frequency Domain Reflectometry |
> | Moisture Range | 0~100% |
> | Accuracy | ±5% |
> | Resolution | 1% |
> | Working Temperature Range | -10°C to 50°C(14℉ to 122℉) |
> | Frequency | 915/868/433MHz depending on location (North American:915MHz; Europe:868MHz; Other areas:433MHz) |
> | Sensor reporting interval | 70 seconds |
> | Transmission distance in open field | 100m(300 feet) |
> | Waterproof Level | IP66 |

> **Power consumption**
> | Soil moisture sensor | 1xAA battery (not included) |
> | Battery life | Minimum 12 months |

The WH51 vs WH51L comparison table (manual p.1–2) gives the IP breakdown:

> | Waterproof Level | **IP66(Device's body and sensor)** | Device's Body: IP66; Sensor: IP68 |
> | Channels | 16 | 16 |

So on the WH51 the **whole unit including the probe is IP66** — not IP68. The **WH51L** variant puts the probe on a 1 m or 5 m cable and rates that probe **IP68**, keeping the battery body out of the wet entirely.

### 3.5 ⚠️ Rated for permanent burial? **No — probe only, to a marked line**

This is the single most important physical caveat and it is stated plainly:

> "Proper Installation for Sensor Safety: To ensure accurate readings and prevent damage, the sensor must be placed in a pre-dug hole in the soil, avoiding forceful insertion into hard, compact earth. For standard use, **bury the probe up to the indicated depth mark on its body**."
> — WH51 manual §3.1

The product itself is moulded with a **`MAX DEPTH ↓`** marking above the black probe blade (visible on the manual cover). The AA battery compartment and LED cap sit **above** the soil line. It is IP66 — rain- and jet-resistant — **not** IP68, so it is not rated for immersion, and a UK border that ponds in winter can submerge a body that was never rated for it.

> "Robust IP66 Waterproof Design: Built with an IP66 rating to withstand harsh outdoor conditions. **An additional silicone protective cap is included for enhanced waterproofing in exceptionally severe environments.**"
> — WH51 manual §3.1

Fit both silicone caps. Weather Spares sells spares: "Ecowitt WH51 Cap Covers for Soil Moisture Sensor" — **£5.00, in stock**.

### 3.6 How many sensors per gateway? **16**

> "Note: The gateway can support max 16 soil moisture sensors. Each new sensor will be recognized as a new channel according to the Power-on sequence."
> — WH51 manual §2.3.2.1

The compatible-gateway table confirms 16 channels for GW1100 (V2.3.6), GW2000 (V3.1.5), GW1200 (V1.3.3), GW3000 (V1.0.2), GW3010 (V1.0.2), WS6210.

⚠️ **The manual contradicts itself.** §4.7 (Ecowitt Weather Server) still says:

> "Note: The WH51 will be recognized as the same sensor type by the software. If you purchased both, they will share **the eight channels** together and the total quantity of the two sensors could not exceed eight."

The "8" is stale text from before the 16-channel firmware. **For HA this is moot** — `aioecowitt` defines `soilmoisture1` … `soilmoisture16`, i.e. 16 channels. Two sensors is nowhere near either limit.

### 3.7 ⚠️ Battery reaches HA as VOLTS, not percent

The brief asked specifically whether battery % reaches HA. **For Ecowitt soil sensors, it does not.** From the library HA core uses:

> ```python
> "soilbatt1": EcoWittMapping("Soil Battery 1", EcoWittSensorTypes.BATTERY_VOLTAGE),
> ...
> "soilbatt16": EcoWittMapping("Soil Battery 16", EcoWittSensorTypes.BATTERY_VOLTAGE),
> ```
> — https://github.com/home-assistant-libs/aioecowitt/blob/main/aioecowitt/sensor.py

And that type renders as a voltage entity:

> ```python
> EcoWittSensorTypes.BATTERY_VOLTAGE: SensorEntityDescription(
>     key="BATTERY_VOLTAGE",
>     device_class=SensorDeviceClass.VOLTAGE,
>     native_unit_of_measurement=UnitOfElectricPotential.VOLT,
>     state_class=SensorStateClass.MEASUREMENT,
>     entity_category=EntityCategory.DIAGNOSTIC,
>     suggested_display_precision=1,
> ),
> ```
> — https://github.com/home-assistant/core/blob/dev/homeassistant/components/ecowitt/sensor.py

**Practical consequence:** a "sensor is dying" automation must threshold on **volts** (a fresh alkaline AA is ~1.5–1.6 V; treat **< ~1.2 V** as replace-soon), not on a percentage. The HA docs' generic line — "**Battery level**: Battery percentage for wireless sensors" — applies to *other* Ecowitt sensor families, not the soil channels. There is also a **Battery status** binary sensor ("Indicates low battery conditions for wireless sensors") which is the cleaner trigger.

This is a genuine win for silent-failure detection: **voltage on an alkaline AA declines smoothly**, so you get weeks of warning, unlike the Zigbee `battery_state: medium` enum.

### 3.8 What the moisture number actually is, and calibration

Entity shape, from HA core:

> ```python
> EcoWittSensorTypes.SOIL_MOISTURE: SensorEntityDescription(
>     key="SOIL_MOISTURE",
>     device_class=SensorDeviceClass.MOISTURE,
>     native_unit_of_measurement=UnitOfRatio.PERCENTAGE,
>     state_class=SensorStateClass.MEASUREMENT,
> ),
> ```

So HA shows `%` with `device_class: moisture`. **But that % is a linear rescale of a raw ADC count, not volumetric water content.** The manual gives the exact formula:

> "Custom OFF:
> Moisture level is calculated based on default dry and wet definition:
> Dry (0%AD) AD: 70
> Wet (100% AD) AD: 500
>
> **Soil Moisture = (moisture AD – 0%AD) \* 100% / (100% AD – 0%AD )**
> Example: when sensor moisture AD is 310, calculated moisture is:
> (310 – 70)\*100% / (500-70) = 56%.
> **This is a fixed slope rate linear system.**"
> — WH51 manual §3.2

**Calibration is explicitly required per soil type:**

> "Custom ON: When pot soil at dry or wet condition is not giving the moisture sensor output value that is close to its default assumption, it will give inaccurate moisture level results. **It is commonly happening with different soil type that gives very different output value at same moisture level condition.** We introduced this custom mode to make this slope flexible so that it can match your soil type."
> — WH51 manual §3.2

> "**Note: In general, the sensor need to be calibrated to suit your soil type.**"
> "Note: The soil moisture sensor should be inserted totally into the soil for accurate result."
> "Record the 0%AD and 100%AD value for future use (when WIFI network changed)."
> — WH51 manual §3.2

**Directly relevant to two different beds:** the border (established garden loam) and the raised planter (bought compost, far more organic matter and air) will give **different AD counts at the same true moisture**. They need **separate calibration**, and therefore **separate irrigation thresholds**. Do not copy one threshold to the other.

> "**Note: Calibration is only saved on gateway side**, so if you have two different consoles handling this data, you will need to enable custom mode and having same calibration for 0% and 100% to make consoles showing same soil moisture."
> — WH51 manual §3.2

⚠️ Gateway-side calibration is set through the **Ecowitt app**, which needs an account. **You can avoid this entirely**: `aioecowitt` also exposes the **raw ADC** to HA —

> ```python
> "soilad1": EcoWittMapping("Soil AD 1", EcoWittSensorTypes.SOIL_RAWADC),
> ```
> with `SOIL_RAWADC = 30, lambda x: x  # Keep it as it comes in`

**Recommended approach: leave the gateway on default calibration, ignore its `%`, and build your own `template` sensor in HA from `Soil AD N`.** You keep the calibration in version-controlled YAML in this repo, per-bed, cloud-free, and adjustable without touching a phone app. Field-calibrate by taking an AD reading at saturation (just after heavy rain / a deep water) and at your genuine dry threshold.

The manual's own bench check for a healthy sensor:

> "Before install the sensor into its permanent location, we would suggest test the sensor in air, and see if moisture reading is 0. And then put the sensor into a cup of water, the sensor should have its reading increased to 90% or above."
> — WH51 manual §2.3.1

### 3.9 Frost and overwintering

The manual gives a **working range of −10 °C to 50 °C**. UK winters sit inside that for the overwhelming majority of hours; the sensor is not rated below −10 °C, which a UK cold snap can briefly breach. Note this is a *working* range, not a survival range — **UNVERIFIED** whether excursions below −10 °C cause permanent damage.

There is **no explicit frost, freeze-thaw or overwintering guidance in the manual.** The only maintenance instruction touching seasonal storage is:

> "**Remove batteries from product during periods of non-use. Battery leakage can cause corrosion and damage to this product.**"
> — WH51 manual §6 Care + Maintenance

⚠️ **This is the corrosion risk that actually applies to the WH51** — not probe corrosion (the probe is FR-4 epoxy with no exposed metal), but **alkaline leakage in the AA compartment**. That risk rises with the exact conditions in question: a full year in-ground, freeze-thaw cycling, and a cell run to exhaustion. Mitigations: use **lithium AA** (better cold performance and far lower leak rate — but note the manual's "Do not mix Alkaline, Lithium, standard, or rechargeable batteries"), and **replace annually on a calendar reminder** rather than waiting for the voltage to collapse.

**Warranty:** "We provide a 2-year limited warranty on this product against manufacturing defects or defects in materials and workmanship." Weather Spares also states its Ecowitt range carries a 2-year warranty as standard.

### 3.10 UK availability (verified live, 2026-09-06)

Queried Weather Spares' Shopify product JSON directly:

| Product | Price | In stock |
|---|---|---|
| Ecowitt WH51 Wireless Soil Moisture Sensor | **£21.00** | ✅ `available: true` |
| Ecowitt GW1200 WiFi Gateway for Sensors | **£30.00** | ✅ |
| Ecowitt GW3000 WiFi or Wired Gateway with SD Card Slot | **£55.00** | ✅ |
| Ecowitt WH51L (extended cable) — 1 m | **£39.00** | ✅ |
| Ecowitt WH51L — 5 m | **£52.00** | ✅ |
| Ecowitt WH52 3-in-1 (moisture + temp + EC) | **£32.00** | ✅ |
| Ecowitt WH51 Cap Covers (spare silicone caps) | **£5.00** | ✅ |
| Ecowitt Soil Moisture Sensor & WiFi Gateway (bundle) | **£56.00** | ✅ |

Verbatim from the WH51 listing (https://weatherspares.co.uk/products/xecowitt-wh51-wireless-8-channel-soil-moisture-sensor):

> "Regular price £25.00 GBP" / "Sale price £21.00 GBP"
> "868MHz UK / European frequency"
> "Power: 1 x AA LR6 Alkaline battery"
> "It is recommended to totally insert the sensor into the soil and keep it in place for 2 to 3 minutes to get an accurate reading."

Weather Spares on frequency (important — **do not buy a 915 MHz US unit**):

> "All Ecowitt products supplied by Weather Spares are 868MHz and suitable for use with others using the same frequency. Ecowitt sensors and weather stations are 868MHz which are both licensed for use in the UK and Europe."

GW3000 listing: "£55.00 GBP", "868MHz UK and European frequency (AE suffix)", "USB C powered (USB cable supplied, power adapter required)".

**Recommended UK basket: 2 × WH51 (£42) + 1 × GW1200 (£30) = £72**, all in stock, all 868 MHz.

### 3.11 Bonus: the WH52 is supported by HA even though the docs don't say so

Weather Spares stocks the **WH52 3-in-1 (moisture + soil temperature + EC), £32, in stock**. It is **not** in the HA docs' supported-devices list — but I verified it works by reading the library:

> ```python
> "soil_ec_hum1": EcoWittMapping("Soil Moisture 1", EcoWittSensorTypes.SOIL_MOISTURE),
> "soil_ec_hum_ad1": ...
> "soil_ec1": ...   # SOIL_EC = 38
> ```
> — `aioecowitt/sensor.py`

and HA core renders EC properly:

> ```python
> EcoWittSensorTypes.SOIL_EC: SensorEntityDescription(
>     key="SOIL_EC",
>     device_class=SensorDeviceClass.CONDUCTIVITY,
>     native_unit_of_measurement=UnitOfConductivity.MICROSIEMENS_PER_CM,
>     state_class=SensorStateClass.MEASUREMENT,
> ),
> ```

Retailer spec: "shares 16 soil moisture channels with WH51/WH51L", "Sends data every 70 seconds", "CIP66-rated for outdoor use".

⚠️ **But the EC sensor is the corrosion liability.** The listing says: "Soil Electrical Conductivity Sensor: **Dual-electrode measurement** determines total soluble salts in soil solution (μS/cm)". Dual-electrode EC means **two exposed metal electrodes passing current through soil** — exactly the geometry that corrodes and drifts over years. The WH51's FR-4 probe has no such exposure. **For a permanent, unattended, irrigation-driving install, prefer the plain WH51.** The WH52 is a nice-to-have for the veg planter's fertiliser management if you accept the electrodes will degrade.

---

## 4. Zigbee via Zigbee2MQTT

### 4.1 Devices that genuinely expose `soil_moisture`

Verified from the Zigbee2MQTT docs source (`Koenkk/zigbee2mqtt.io/docs/devices/*.md`):

| Page | Vendor | Description | Exposes |
|---|---|---|---|
| `TS0601_soil` | Tuya | "Soil sensor" | `temperature, soil_moisture, temperature_unit, battery, battery_state` |
| `TS0601_soil_2` | Tuya | "Soil sensor" | `soil_moisture, temperature, temperature_f, temperature_sensitivity, humidity_sensitivity, temperature_alarm, humidity_alarm, max_temperature_alarm, min_temperature_alarm, max_humidity_alarm, min_humidity_alarm, schedule_periodic, battery, battery_state` |
| `TS0601_soil_3` | Tuya | "Soil sensor" | `temperature, soil_moisture, temperature_unit, battery, battery_state` |
| `GX04` | **GIEX** | "**Soil Moisture Sensor**" | `temperature, soil_moisture, temperature_unit, battery, battery_state` |

Attribute definition, quoted verbatim (identical across all four):

> "### Soil moisture (numeric)
> Measured soil moisture value.
> Value can be found in the published state on the `soil_moisture` property.
> It's not possible to read (`/get`) or write (`/set`) this value.
> The unit of this value is `%`."

Battery:

> "### Battery (numeric)
> Remaining battery in %, **can take up to 24 hours before reported**.
> ... The minimal value is `0` and the maximum value is `100`. The unit of this value is `%`."

Z2M offers a per-device calibration hook, which partly answers the calibration question:

> "`soil_moisture_calibration`: Calibrates the soil_moisture value (absolute offset), takes into effect on next report of device."

⚠️ Note this is an **absolute offset only** — a single additive shift. It **cannot** rescale a slope, so it cannot properly map a raw index onto two very different soils (loam border vs compost planter) the way the Ecowitt 0%AD/100%AD two-point calibration can.

### 4.2 ⚠️ Correction: **GX02 is not a soil sensor**

The brief listed "GiEX GX02/QT-07S" as candidate soil sensors. **GX02 is a water valve / irrigation timer**, not a sensor — confirmed by the Z2M new-device issue "[New device support]: GiEX Water Valve GX02 · Issue #21844". The GIEX **soil** sensor is **`GX04`**, "Soil Moisture Sensor", added 2024-12-10.

### 4.3 ⚠️ Correction: **QT-07S does not report soil moisture**

Verbatim from https://github.com/Koenkk/zigbee2mqtt.io/blob/master/docs/devices/QT-07S.md:

> | Model | QT-07S |
> | Vendor | Tuya |
> | Description | Soil sensor |
> | **Exposes** | **battery, temperature, humidity, illuminance** |

> "### Humidity (numeric)
> **Measured relative humidity.**
> Value can be found in the published state on the `humidity` property."

Despite being described as a "Soil sensor", QT-07S exposes **`humidity` typed as relative humidity**, not `soil_moisture`. In HA this lands with `device_class: humidity`. **This is precisely the "humidity not soil moisture" trap the brief asked about — QT-07S is disqualified.**

Same trap in the Tuya BLE ecosystem, for the SGS01:

> "SGS01 (gvygg3m8) exposes soil moisture as humidity #132" — "it is exposing the moisture as humidity". Closed as **"not planned"**.
> — https://github.com/PlusPlus-ua/ha_tuya_ble/issues/132

### 4.4 SONOFF has no soil moisture sensor

Checked `SNZB-01P` — it is a "Wireless button" exposing `battery, voltage, action`. No SONOFF soil moisture sensor exists in the Z2M device list as of 2026-09-06.

---

## 5. ⚠️ Zigbee reliability record — the battery-reporting problem

This is the strongest argument against making Zigbee the primary choice, and it comes straight from the Zigbee2MQTT issue tracker. **Four separate, independently-filed defects, all about battery reporting being wrong** — which is exactly the "dies silently" failure mode the brief flags as unacceptable.

**1. Battery drain from over-reporting** — Issue #17500, `_TZE200_myd45weu` (closed 2023-07-21):
> "I have this plant moisture soil sensor and the battery drains way too quickly. I have it under 6 weeks and already **battery has went from 100% to 20%**. I notice it reports way too much than necessary for something like this. When using only info log, it seems it **reports every 40 seconds, non-stop**. ... I tried changing the reporting settings, but nothing sticks and it keeps giving me a timeout"

**2. Battery reads 60 % when brand new** — Issue #24611, `TS0601_soil_3` (closed 2024-12-07):
> "When placing new alkaline batteries in the device, it only reports 60% battery. The batteries are brand new and 1.55V, so it should be full. I tried with different batteries."

**3. The fix didn't hold — 50 % across ten units** — Issue #26215, `TS0601_soil_3` (opened 2025-02-06, **closed 2025-10-31**):
> "I use **over 10 of the TS0601_soil_3, all with brand new batteries and each sensor shows me a maximum battery level of 50 percent.** I have seen this problem #24611 should have been solved by a fix in the zigbee-herdsman-converters with release 21.3.0. ... **Unfortunately not for me.** I am using the latest Zigbee2MQTT version 2.1.0"

**4. Battery level tracks temperature** — Issue #23729, `TS0601_soil_2` / `_TZE284_sgabhwa6` (closed 2025-04-25):
> "The battery level is wrong, **changing its value together with the temperature.** In the official Tuya app it is working fine."

**5. Moisture and battery values transposed** — Issue #27346, `TS0601_soil_3` (closed 2025-10-06):
> "For the Tuya TS601_soil_3 sensor the values are **mixed up between 'humidity' and 'battery level'**"
> with the payload showing `"battery":100, "humidity":34` rendering in HA as `Soil moisture 100%` / `Battery 34%`.

**Reading of this evidence:** the *moisture* channel is broadly fine; the **battery channel is unreliable across at least three variants and multiple firmware/converter generations**, and #26215 ran for **eight months** before closing. Since the whole point of battery reporting here is to catch a dying sensor before an irrigation automation starts acting on a stale reading, a battery figure that reads 50 % on a fresh cell — or that swings with soil temperature — **does not provide the safety property required.**

Mitigation if you go Zigbee anyway: **do not trust `battery`.** Build the dead-sensor alarm on **staleness** instead — e.g. a template binary sensor on `last_seen` / `last_reported` exceeding ~3 × the reporting interval. (This mirrors the existing house lesson in `learnings/` — *"A silent sensor is not an absent person"* — compare `last_reported` across channels rather than trusting a single value.)

---

## 6. ⚠️ Capacitive vs resistive — the key long-term discriminator

Resistive probes pass DC through two exposed metal electrodes; electrolysis corrodes them within a season or two and the reading drifts steadily before failing. Capacitive/FDR probes measure the soil's dielectric permittivity through an insulated substrate — no galvanic contact, no electrolysis.

| Candidate | Technology | Source quality |
|---|---|---|
| **Ecowitt WH51** | **Non-resistive — FDR / capacitive** | ✅ **Manufacturer manual, two places** |
| Ecowitt WH52 (moisture) | Non-resistive | ✅ Same platform |
| Ecowitt WH52 (**EC channel**) | **"Dual-electrode measurement"** → exposed electrodes, corrosion-prone | ✅ Retailer spec |
| Tuya `TS0601_soil*`, GIEX `GX04` | **UNVERIFIED** | ❌ No manufacturer datasheet found |
| Tuya `QT-07S` | **UNVERIFIED** (and reports humidity anyway) | ❌ |
| Mi Flora HHCCJCY01 | **UNVERIFIED** | ❌ Product page gone (discontinued) |
| DIY "Capacitive v1.2" | Capacitive by construction | ✅ Self-evident |

### ⚠️ The WH51 manual contradicts itself on which it is

Both statements appear in the same document:

> §3.1: "**Advanced Capacitive Sensing**: Utilizes the principle of soil dielectric permittivity to measure moisture levels, where water presents the highest reading and air the lowest."
> §5: "| Measurement Principle | **Frequency Domain Reflectometry** |"

These are related but not identical (FDR excites the probe at RF and measures a frequency shift; simple capacitive measures capacitance directly). **The distinction does not matter for the corrosion question** — both are dielectric methods, and the decisive fact is independently stated in the spec table: **"Material of Probe | FR-4(Glass Fiber Reinforced Epoxy)"**. FR-4 is insulating fibreglass PCB laminate with **no exposed metal electrode**. That is the correct construction for a multi-year buried install, and it is the strongest single reason to prefer the WH51.

**For the Tuya/GIEX Zigbee units, treat the technology as UNVERIFIED.** Blog reviews assert the SGS01Z is capacitive, but no manufacturer datasheet backs it. Given they are white-label Tuya hardware sold under many brands, **you cannot rely on any given shipment matching a review of a different unit.** Inspect the probe on arrival: an exposed metal fork or two bare pads = resistive, return it; a uniform coated/laminated blade = capacitive.

---

## 7. Mi Flora / Flower Care HHCCJCY01 — honest assessment: **do not use**

**HA support is genuine and local.** From https://www.home-assistant.io/integrations/xiaomi_ble/:
> "Its IoT class is Local Push."
> "HHCCJCY01, also known as MiFlora or 'Flower Care'" — listed as supported.

**But it fails this brief on four counts:**

1. **Discontinued.** No current manufacturer product page; the HA community thread is literally titled "Xiaomi Mi Flower Care Plant Sensor EOL?". No warranty, no spares, no replacement path if one dies mid-season.
2. **BLE range.** Bluetooth from a border or planter to the house needs a BLE proxy (an ESPHome device) outdoors. That is a second outdoor device to weatherproof and power — more failure surface than a sub-GHz sensor that just reaches a gateway 100 m away.
3. **Battery is awkward.** CR2032 coin cell (~1 year, **UNVERIFIED**), and the HA docs note battery retrieval "requires direct connection, occurring only once a day". A coin cell in a wet UK border is the worst case for contact corrosion.
4. **Bindkey / entity-loss churn.** Multiple open/closed HA core issues: "Xiaomi flower care sensor (HHCCJCY01) ignore missing bindkey" (#135754), "Xiaomi BLE plant sensor entities unavailable" (#91237), and community reports of moisture/fertility/lux entities disappearing while temperature survives.

**Outdoor durability: UNVERIFIED.** A blog cites "IP5" (not a valid IP code — likely a garbled IPX5), and I could find **no manufacturer IP rating from a primary source**. The device is marketed for houseplants. I will not assert an outdoor rating it does not document. Widespread anecdotal reports of outdoor failure exist but I found **no primary source** confirming a systematic outdoor/corrosion defect — so I am recommending against it on the four verified grounds above, not on unverified failure folklore.

---

## 8. SwitchBot / Aqara — neither sells a soil moisture sensor

- **SwitchBot**: the "Outdoor Meter" is IP65 **temperature and humidity** ("Swiss Sensirion sensor for precise temperature & humidity monitoring"). **Air humidity, not soil moisture.** No soil product in the range.
- **Aqara**: no soil moisture sensor exists. The Aqara community forum carries a *feature request* — "Soil moisture sensor for the Aqara lineup" (Aug 2025) — asking for one to be created, which confirms its absence.

Both are disqualified: they measure air humidity, exactly the substitution the brief warned against.

---

## 9. DIY ESPHome capacitive — baseline comparison only

Genuinely local by definition, and ESPHome has **first-party components for two proper industrial soil probes**: `pmwcs3` ("PMWCS3 Capacitive Soil Moisture and Temperature Sensor", https://esphome.io/components/sensor/pmwcs3/) and `smt100` ("SMT100 Soil Moisture Sensor", https://esphome.io/components/sensor/smt100/). Either is a step up in measurement quality over any consumer unit here.

**Why it's the baseline and not the pick, for this job:**
- **Weatherproofing is on you.** The common "Capacitive v1.2" board is an uncoated PCB; its exposed traces wick moisture and fail within a season unless conformal-coated and potted. A commercial IP66 unit ships solved.
- **Power.** Wi-Fi + ESP32 outdoors on battery is a genuine engineering exercise (deep sleep, solar). Mains or frequent recharging is the realistic outcome — bad for a border 20 m down the garden.
- **ADC non-linearity.** Calibration is mandatory *and* the ESP32's own ADC is non-linear, so even a two-point calibration leaves error in the middle of the range — the region an irrigation threshold actually sits in.
- **You already have the failure mode this must avoid.** A DIY sensor that drifts or dies quietly is precisely the risk the brief names.

**Verdict:** worth building later as a *cross-check* against the WH51's calibration, not as the thing irrigation depends on in year one.

---

## 10. Recommendation and install notes

**Buy: 2 × Ecowitt WH51 (£21 ea) + 1 × Ecowitt GW1200 (£30) from Weather Spares = £72**, all 868 MHz, all confirmed in stock 2026-09-06. Add 2 × spare cap covers (£5) if you want a cheap resilience margin. Choose the **GW3000 (£55)** instead only if you want the Ethernet + microSD local logging.

**Install:**
1. Bench-test each sensor per the manual (air → 0 %, cup of water → ≥ 90 %) **before** burying. Keep the pairing order — channel number follows power-on sequence.
2. Dig a pre-formed hole; never force the probe. Bury **only to the `MAX DEPTH` mark**. Fit both silicone caps.
3. Site the body so it cannot sit in standing water — the unit is IP66, **not** IP68. In the border, consider mounding slightly or choosing a spot that drains. If any location genuinely ponds in winter, buy the **WH51L (£39)** for that spot instead and keep its battery body out of the wet on the 1 m cable — its probe is **IP68**.
4. Point the gateway at HA over **HTTP**, at the port HA actually serves on (verify — do not assume the 8123 most guides print), using the `192.168.4.1` web UI — **no Ecowitt account needed**.
5. **Calibrate each bed separately** in HA off `Soil AD N`, not off the gateway `%`. The loam border and the compost planter will not share a threshold.
6. **Alarm on `Soil Battery N` voltage (< ~1.2 V) plus staleness of `last_reported`**, not on a battery percentage — the soil channels report volts, not percent.
7. Diarise an **annual battery swap**; consider lithium AA for cold performance and leak resistance (do not mix chemistries).

---

## 11. ⚠️ Biggest reliability gotchas, ranked

1. **The WH51 is not a buriable device — only its probe is, to a moulded line.** "bury the probe up to the indicated depth mark on its body". The AA compartment stays above ground at **IP66 (not IP68)**, so a spot that ponds in a wet UK winter will submerge a body never rated for immersion. This is the most likely physical killer of a multi-year install, and it is entirely avoidable by siting — or by using the WH51L, whose probe is IP68 on a cable.
2. **Tuya/GIEX Zigbee battery reporting is measurably broken** — five separate tracker issues: 50–60 % on brand-new cells across ten units, battery level swinging with temperature, moisture and battery values transposed, and one defect that ran eight months before closing. A sensor that cannot honestly report its own battery cannot warn you before it dies mid-irrigation-season.
3. **The `%` is a raw linear index, not volumetric water content, and needs per-soil calibration** — "In general, the sensor need to be calibrated to suit your soil type." Two beds, two soils, two calibrations, two thresholds. Copying one threshold to the other will silently over- or under-water a whole bed.
4. **Ecowitt soil battery arrives in HA as volts, not percent** (`soilbatt*` → `BATTERY_VOLTAGE`). A `battery < 20` automation written from the generic docs will simply never fire.
5. **"Soil sensor" in a product name does not mean it reports soil moisture.** QT-07S exposes `humidity` (relative humidity); Tuya BLE SGS01 does the same and the report was closed "not planned". Check the exposed attribute name, not the marketing.
6. **Buy 868 MHz.** A 915 MHz US-market WH51 will not talk to an EU gateway.
7. **Corrosion risk on the WH51 is in the battery compartment, not the probe** — the FR-4 probe has no exposed metal, but the manual warns "Battery leakage can cause corrosion and damage to this product." Annual swap; don't run cells to exhaustion in-ground.
8. **The WH52's EC channel uses "Dual-electrode measurement"** — exposed electrodes that will corrode and drift over years. If long-term stability is the priority, take the plain WH51.

---

## 12. Verbatim quotes index

All quotes above are inline with their URLs. Primary sources used:

- **WH51 manual (PDF)** — https://oss.ecowitt.net/uploads/20251226/WH51Manual.pdf — §2.3.1, §2.3.2.1, §3.1, §3.2, §4.7, §5, §6, §7.1
- **HA Ecowitt integration docs** — https://www.home-assistant.io/integrations/ecowitt/ and source https://github.com/home-assistant/home-assistant.io/blob/current/source/_integrations/ecowitt.markdown
- **HA core Ecowitt sensor definitions** — https://github.com/home-assistant/core/blob/dev/homeassistant/components/ecowitt/sensor.py
- **aioecowitt sensor mappings** — https://github.com/home-assistant-libs/aioecowitt/blob/main/aioecowitt/sensor.py
- **HA Xiaomi BLE docs** — https://www.home-assistant.io/integrations/xiaomi_ble/
- **Zigbee2MQTT device pages (docs source)** — `TS0601_soil.md`, `TS0601_soil_2.md`, `TS0601_soil_3.md`, `GX04.md`, `QT-07S.md`, `SNZB-01P.md` at https://github.com/Koenkk/zigbee2mqtt.io/tree/master/docs/devices
- **Zigbee2MQTT issues** — #17500, #23729, #24611, #26215, #27346, #21844 at https://github.com/Koenkk/zigbee2mqtt/issues
- **ha_tuya_ble issue #132** — https://github.com/PlusPlus-ua/ha_tuya_ble/issues/132
- **Weather Spares (UK retailer)** — https://weatherspares.co.uk/ — live prices/stock via Shopify `products.json`, 2026-09-06
- **Ecowitt UK shop** — https://shop.ecowitt.com/en-gb/products/ecowitt-gw1206-soil-moisture-sensor-kit
- **ESPHome components** — https://esphome.io/components/sensor/pmwcs3/, https://esphome.io/components/sensor/smt100/

**Excluded as non-primary:** smarthomeexplorer.com, zigbeehubs.com blog, smarthomecompared.com, manuals.plus, grokipedia.com. smarthomescene.com used only for non-load-bearing corroboration, never for a capability claim.

---

# Part 3 — Backflow, UK regulations, winterising, mounting

# UK Garden Drip Irrigation: Regulations, Winterising and Mounting

Research date: 2026-09-06. Scope: England, domestic garden, fed from an existing outside tap.

**Source grading used throughout:**
- **[LAW]** — the statutory instrument itself (legislation.gov.uk).
- **[GUIDANCE]** — the Defra guidance document issued under Regulation 4(3). This is the official interpretive document; compliance with it is the accepted route to compliance.
- **[MFR]** — manufacturer's own manual/support site.
- **[MFR-REPRO]** — manufacturer manual text reproduced on a third-party manual host (manuals.plus etc.). Treated as manufacturer text but flagged.
- **[TRADE]** — irrigation retailer/installer technical guidance. Not regulatory, not manufacturer.

---

## 1. Backflow prevention and UK law

### 1.1 The headline answer

**A 3/4" double check valve alone is NOT legally sufficient for a drip/porous-pipe garden irrigation system.** But the reason is *not* that the system is Fluid Category 5. Both claims in the question are wrong:

- It is **not** Fluid Category 3 (so a DCV alone does not cover it).
- It is **not** Fluid Category 5 either — *in a domestic house garden*. FC5 applies to permeable pipe in **non-domestic** gardens.
- A domestic garden drip line / porous hose is **Fluid Category 4**.

The guidance prescribes a specific permitted arrangement for house gardens: **a double check valve (per G15.20/G15.21) PLUS a Type DB pipe interrupter**. The DCV alone does not satisfy it; the Type DB is the part that gets you from FC3 to FC4 protection.

### 1.2 The fluid category — verbatim

Source: Defra, *Water Supply (Water Fittings) Regulations 1999 — Guidance Document relating to Schedule 1: Fluid Categories and Schedule 2: Requirements For Water Fittings [See Regulation 4(3)]*. PDF: https://hotun.co.uk/wp-content/uploads/2021/03/waterregs99-guidance.pdf

**Table 6.1c — Determination of fluid category 3**, examples list includes: [GUIDANCE]

> "Domestic or commercial irrigation systems, without insecticide or fertilizer additives, and with fixed sprinkler heads not less than 150 mm above ground level."

**Table 6.1d — Determination of fluid category 4**, under the sub-heading **"House gardens"**: [GUIDANCE]

> "Mini-irrigation systems without fertilizer or insecticide application; such as pop-up sprinklers or permeable hoses"

**Table 6.1e — Determination of fluid category 5**, under "General": [GUIDANCE]

> "Permeable pipes in other than domestic gardens, laid below or at ground level, with or without chemical additives."

And under "Commercial agricultural": [GUIDANCE]

> "Commercial irrigation outlets below or at ground level and/or permeable pipes, with or without chemical additives."

Both tables carry the note: [GUIDANCE]

> "Note: The list of examples of applications shown above for each fluid category is not exhaustive."

**Reading:** the FC3/FC4/FC5 line is drawn by two variables — (a) how close the discharge is to the soil, and (b) whether it is a domestic house garden or not. Fixed heads ≥150 mm above ground = FC3. Permeable/drip pipe at or near soil level in a **house garden** = FC4. The same thing in a **non-domestic** garden = FC5.

Statutory definitions [LAW] — https://www.legislation.gov.uk/uksi/1999/1148/schedule/1/made — are generic and do not mention irrigation:

> Fluid Category 3: "Fluid which represents a slight health hazard because of the concentration of substances of low toxicity, including any fluid which contains–(a) ethylene glycol, copper sulphate solution or similar chemical additives, or (b) sodium hypochlorite (chloros and common disinfectants)."

> Fluid Category 4: "Fluid which represents a significant health hazard because of the concentration of toxic substances, including any fluid which contains–(a) chemical, carcinogenic substances or pesticides (including insecticides and herbicides), or (b) environmental organisms of potential health significance."

> Fluid Category 5: "Fluid representing a serious health hazard because of the concentration of pathogenic organisms, radioactive or very toxic substances, including any fluid which contains–(a) faecal material or other human waste; (b) butchery or other animal waste; or (c) pathogens from any other source."

So the FC4 classification of a domestic dripline rests on limb (b) of FC4 — "environmental organisms of potential health significance", i.e. soil organisms — as applied by the guidance tables. This is the source of the confusion in the question: soil contact does drive the classification upward, but for a *house garden* it stops at 4, not 5.

### 1.3 The clause that is often misquoted as making it FC5

The guidance contains this, which is where the "FC5 / air gap" claim comes from: [GUIDANCE]

> "G15.19 Soil watering systems installed in close proximity to the soil surface (that is, where the watered surface is less than 150 mm below the water outlet discharge point) for example, irrigation systems, permeable hoses etc., are considered to be a fluid category 5 risk and should only be supplied with water through a Type AA, AB, AD or AUK1 air gap arrangement."

**Critical context: G15.19 sits under the section heading "Commercial and other installations excluding house gardens".** The immediately preceding clause, G15.18, opens "Any taps and fittings used for supplying water for non-domestic applications, such as commercial, horticultural, agricultural or industrial purposes...". The next heading in the document is "House garden installations", which introduces G15.20 onward.

So G15.19 is **not** the clause governing a domestic garden. Quoting it at a homeowner overstates the requirement. It is consistent with Table 6.1e ("Permeable pipes in **other than** domestic gardens").

### 1.4 The clause that actually governs a domestic garden dripline

Under the heading **"House garden installations"**: [GUIDANCE]

> "G15.20 Taps to which hoses are, or may be connected and located in house garden locations are to be protected against backflow by means of a double check valve. The double check valve should be located inside a building and protected from freezing. (See Figure 6.3a)."

> "G15.21 Where, in existing house installations, a hose pipe is to be used from an existing hose union tap located outside a house and which is not provided with backflow protection, either:
> a. the existing hose union tap should be provided with a double check valve located inside the building; or,
> b. the tap should be replaced with a hose union tap that incorporates a double check valve (Type HUK1); or,
> c. a hose union backflow preventer (Type HA) or a double check valve should be continuously fitted to the outlet of the tap."

And then, decisively:

> "G15.23 Where mini-irrigation systems, such as porous hoses, are installed in house garden situations only, a hose union tap with backflow protection in accordance with clauses G15.20 or G15.21 combined with a pipe interrupter with atmospheric vent and moving element device (Type DB) at the connection of the hose to the hose union tap, or not less than 300 mm above the highest point of the delivery point of the spray outlet or the perforated surface of the porous hose, whichever is the highest, is acceptable. See Figure 6.3b and Figure 6.3c."

**This is the operative clause.** Required arrangement = DCV **+** Type DB.

Note also G15.22, relevant if fertiliser is ever injected: [GUIDANCE]

> "G15.22 Where fixed or hand-held devices are used with hose pipes for the application of fertilizers or domestic detergents the minimum backflow protection provided should be suitable for protection against a fluid category 3 risk. Backflow protection against a fluid category 5 risk should be provided where these devices are used for the application of insecticides."

### 1.5 Why the DCV alone cannot be sufficient — the device rating table

From **Table S6.2: Schedule of mechanical backflow prevention arrangements and the maximum permissible fluid category for which they are acceptable** (columns: backpressure / backsiphonage): [GUIDANCE]

| Type | Description (verbatim) | Backpressure | Backsiphonage |
|---|---|---|---|
| EC | "Verifiable double check valve" | 3 | 3 |
| ED | "Non-verifiable double check valve" | 3 | 3 |
| DB | "Pipe interrupter with atmospheric vent and moving element" | X | 4 |
| HUK1 | "Hose union tap which incorporates a double check valve. Only permitted for replacement of existing hose union taps in house installations" | 3 | 3 |
| HA | "Hose union backflow preventer. Only permitted for use on existing hose union taps in house installations" | 2 | 3 |
| BA | "Verifiable backflow preventer with reduced pressure zone" | 4 | 4 |

> "1 X Indicates that the backflow prevention device is not acceptable for protection against backpressure for any fluid category within water installations in the UK."

A double check valve tops out at **fluid category 3**. The application is fluid category 4. Arithmetically, a DCV alone is short by one category — which is exactly why G15.23 pairs it with a Type DB (rated 4 for backsiphonage). The DCV covers backpressure to FC3; the DB covers backsiphonage to FC4. That combination is what the guidance declares "acceptable".

**Type DB definition, verbatim:** [GUIDANCE]

> "'Type DB - Pipe interrupter with atmospheric vent and moving element' means a mechanical backflow prevention device with an air inlet closed by a moving element when the device is in normal use but which opens and admits air if the water pressure upstream of the device falls to atmospheric pressure, the device being installed so that the flow of water is in a vertical, downward direction."

**Installation constraints on a Type DB — these matter practically:** [GUIDANCE]

> "2 Arrangements incorporating a Type DB device shall have no control valves on the outlet of the device. The device shall be fitted not less than 300mm above the spillover level of an appliance and discharge vertically downwards."

**This is a real design constraint for a smart-irrigation build.** "No control valves on the outlet of the device" means the Type DB must go **downstream of the tap timer/solenoid**, not between the tap and the timer. Combined with the G15.23 positioning ("not less than 300 mm above the highest point of the... perforated surface of the porous hose"), the practical layout is: tap (with DCV) → timer → filter/regulator → **Type DB, 300 mm above the highest dripline, discharging downwards** → dripline. A DB screwed onto the tap with the timer after it would violate note 2.

### 1.6 Does the answer differ for above-ground vs buried dripline?

**Partially, and the guidance is less crisp here than one would like.**

- The **150 mm rule** is the explicit discriminator, and it is expressed in G15.19 as "where the watered surface is less than 150 mm below the water outlet discharge point". Table 6.1c's FC3 example likewise requires "fixed sprinkler heads not less than 150 mm above ground level".
- So **fixed emitters held ≥150 mm above soil level** (e.g. drippers on riser stakes into pots/baskets) fall in the **FC3** example list, and a double check valve alone would be adequate for that arrangement.
- **Dripline lying on the soil surface** is <150 mm above the surface and is a "permeable hose" — **FC4**, needing the G15.23 DCV+DB arrangement.
- **Buried dripline** is a fortiori at or below ground level. In a house garden the guidance still routes it through the FC4 house-garden treatment (Table 6.1d does not distinguish buried from surface-laid for house gardens; Table 6.1e's FC5 entry is explicitly limited to "other than domestic gardens"). **However**, note that Table 6.1e's phrase "laid below or at ground level" shows the drafters had burial in mind as an aggravating factor, and the FC5 entry is separated from house gardens only by the domestic/non-domestic word. **[Partial UNVERIFIED]** — I found no clause that expressly addresses *buried* dripline in a *domestic* garden. The conservative reading, and the one a water undertaker is likely to take, is that buried domestic dripline is at least FC4 and should get the G15.23 treatment; some inspectors may push for FC5/air gap. A trade source takes exactly this stricter line — see 1.8.

### 1.7 Notification to the water undertaker — required? YES

**[LAW]** *The Water Supply (Water Fittings) Regulations 1999*, Regulation 5. Source: https://www.legislation.gov.uk/uksi/1999/1148/regulation/5/made

> "5.—(1) Subject to paragraph (2), any person who proposes to instal a water fitting in connection with any of the operations listed in the Table below–
> (a) shall give notice to the water undertaker that he proposes to begin work;
> (b) shall not begin that work without the consent of that undertaker which shall not be withheld unreasonably; and
> (c) shall comply with any conditions to which the undertaker's consent is subject."

From the Table, item 4:

> "4. The installation of–
> ...
> (g) a reduced pressure zone valve assembly or other mechanical device for protection against a fluid which is in fluid category 4 or 5; or
> (h) **a garden watering system unless designed to be operated by hand**; or
> (i) any water system laid outside a building and either less than 750mm or more than 1350mm below ground level."

Note the exemption, and note what it does *not* cover:

> "(2) This regulation does not apply to the installation by an approved contractor of a water fitting falling within paragraph 2, 4(b) or 4(g) in the Table."

**So: an automatic (timer-controlled) garden watering system is item 4(h) and IS notifiable. The approved-contractor exemption in 5(2) covers 4(b) and 4(g) but NOT 4(h)** — so even employing an approved contractor does not remove the notification duty for a garden watering system. A hand-operated hose is outside 4(h) ("unless designed to be operated by hand").

A smart, scheduled, HA-controlled drip system is squarely *not* "designed to be operated by hand".

Timescales: [LAW]

> "(4) The water undertaker may withhold consent required under paragraph (1), or grant it subject to conditions, by a notice given before the expiry of the period of ten working days commencing with the day on which notice under that paragraph was given."

> "(5) If no notice is given by the water undertaker within the period mentioned in paragraph (4), the consent required under paragraph (1) shall be deemed to have been granted unconditionally."

What the notice must contain: [LAW]

> "(3) The notice required by paragraph (1) shall include or be accompanied by–
> (a) the name and address of the person giving the notice, and (if different) the name and address of the person on whom notice may be served under paragraph (4) below;
> (b) a description of the proposed work or material change of use, and
> (c) particulars of the location of the premises to which the proposal relates, and the use or intended use of those premises;
> (d) except in the case of a fitting falling within paragraph (1)(d)(iii)–(v) or (1)(e) above–
> (i) a plan of those parts of the premises to which the proposal relates, and
> (ii) a diagram showing the pipework and fitting to be installed; and
> (e) where the work is to be carried out by an approved contractor, the name of the contractor."

**Practical read:** notify, include a pipework diagram, and if they say nothing within 10 working days consent is deemed granted unconditionally. Low friction, but it is a legal duty, not a courtesy.

### 1.8 Corroborating trade interpretation (secondary, but consistent — and stricter)

LWS Irrigation, *Interpretations of regulations relating to domestic and commercial irrigation installations*: https://www.lws.uk.com/images/uploaded/Resources/Technical-Documents/water-regulations.pdf [TRADE]

> "It is a requirement that NO garden watering system installation, other than a hand held hose, is started without consent of [the undertaker]"

> "1. Drip line/leaky/porous hose in domestic gardens only - As per Fluid Category 3 (double check valve) in conjunction [with] ... hose union tap, or not less than 300mm above the highest point of the delivery point of the mini-spray outlet or the perforated surface of the porous hose, whichever is the highest. Arrangements incorporating a Type DB device shall ... discharge vertically downwards. Pop-up sprinklers are not permitted with this arrangement."

> "2. BA - verifiable backflow preventer with reduced pressure zone. Domestic installations incorporating pop-up sprinklers [...]"

Their "Domestic gardens - minimum requirements" summary table: [TRADE]

> "Drip irrigation such as baskets/pots etc. - Category 3 – fixed heads/emitters not less than 150mm above ground/soil level."
> "Micro-sprays - Category 3 – sprays on riser stakes fixed not less than 150mm above ground/soil level"
> "Dripline/porous/leaky pipe - Category 4"
> "Pop-up sprinklers - Category 4"

This independently confirms the reading in 1.6: **emitters ≥150 mm above soil = Cat 3 (DCV enough); dripline/porous pipe on the ground = Cat 4 (DCV + Type DB).** Note their item 1 describes the *device* arrangement starting from the Cat 3 tap protection and adding the DB — same construction as G15.23.

### 1.9 What a typical UK outside tap already has, and how to check

**[GUIDANCE]** G15.20 (quoted above) requires, for new work, a double check valve **"located inside a building and protected from freezing"** — i.e. on the indoor side of the wall on the pipe feeding the tap, not out in the weather. G15.21 allows, for existing installations, either an indoor DCV, a **Type HUK1** tap (DCV built into the tap body), or a **Type HA** hose union backflow preventer / DCV "continuously fitted to the outlet of the tap".

**[Primary-ish, WaterSafe — the UK government-supported plumber accreditation body]** https://www.watersafe.org.uk/advice/weather-hacks/

> "Homes built since 1999 typically have an inline double check valve built into the supply pipe to the outside tap, and those built before that point usually have one built into the tap."

> "Help prevent water and bacteria from contaminating your tap water supply by ensuring your outside taps have a double check valve installed."

> "DO fit a compliant double check valve to garden taps. The british standard (BS EN 806-5) states check valves should be replaced every ten years."

**How to check whether yours already has one:**
1. **Look inside first.** Post-1999 installs put the DCV indoors on the feed pipe, per G15.20 — trace the pipe back from where it passes through the wall and look for a short brass in-line body (often with an arrow showing flow direction) between the isolating valve and the wall penetration.
2. **Look at the tap body.** A Type HUK1 tap has the DCV integral; it is usually stamped/marked, and the body between the wall flange and the outlet is noticeably longer and fatter than a plain bib tap.
3. **Look at the outlet.** A Type HA hose union backflow preventer is a separate short brass adaptor permanently fitted to the threaded outlet, before the hose connector.
4. **Check the date.** Pre-1999 taps frequently have nothing at all, which is precisely why G15.21 exists.
5. **The 10-year rule.** Even if one is present, BS EN 806-5 (per WaterSafe) calls for replacement every ten years — an old DCV is not automatically a working DCV.

**Important consequence for this build:** even a tap that *does* have an integral or in-line DCV is only FC3-protected. It does not, on its own, make a dripline installation compliant. The Type DB is the missing piece regardless.

### 1.10 Bottom line for section 1

| Configuration | Fluid category | Required protection |
|---|---|---|
| Hand-held hose, self-closing | 3 | DCV (G15.20/21). Not notifiable. |
| Drippers on stakes, emitters ≥150 mm above soil | 3 | DCV alone is sufficient. Notifiable if automatic. |
| Dripline / porous pipe on the soil surface, house garden | 4 | DCV **+ Type DB**, DB ≥300 mm above highest dripline, discharging downwards, no valves downstream of it. Notifiable. |
| Buried dripline, house garden | 4 (at least) — see 1.6 | Same as above; some undertakers may require more. Notifiable. |
| Permeable pipe, non-domestic garden | 5 | Type AA/AB/AD/AUK1 air gap only. |
| Any of the above with insecticide injection | 5 | Air gap. |

**Answer to the direct question: NO — a 3/4" double check valve is not legally sufficient for a soil-level drip/porous-pipe system. It is sufficient only if every emitter sits at least 150 mm above soil level.**

---

## 2. Winterising a tap-mounted smart controller in the UK

### 2.1 Gardena

Source: GARDENA Water Control Select (Art. 1891) operating instructions, reproduced at https://manuals.plus/gardena/1891-water-control-select-timer-manual [MFR-REPRO]

Storage:
> "The product must be stored away from children. To preserve the battery, it should be removed. Store the controller and the valve unit in a dry, enclosed and frost-free place."

Warranty:
> "Damage caused by frost is not covered by the warranty."

Technical data:
> Min/max operating pressure: "0.5 bar / 12 bar"; operating temperature "5 °C to 50 °C"; max liquid temperature "40 °C"; battery "1 × 9V alkaline manganese (IEC 6LR61)".

Mounting orientation (see also section 3):
> "The Water Control may only be set up vertically with the sleeve nut to the top to prevent water from penetrating into the battery compartment."
> "Avoid tensile strain. Do not pull the hose connected to the Water Control."

Corroborating, GARDENA smart Water Control: [MFR-REPRO] https://manuals.plus/gardena/smart-water-control-system-manual
> "To preserve the batteries, these should be removed" / "Stow the Water Control in a dry area where it has protection from frost."
> Operating pressure minimum 0.5 bar, maximum 12 bar; water temperature max 40 °C; ambient +5 °C to +50 °C; 3 × LR6 (AA).

Also relevant — GARDENA Water Distributor automatic (Art. 1197), which is the multi-zone unit many drip builds pair with a timer. Full operating instructions PDF obtained and text-extracted. [MFR]

> "6. Putting into Storage
> Storage / storage during winter:
> ATTENTION! Water Distributor may be damaged as the product is not frost-resistant!
> V Protect the Water Distributor against frost.
> 1. Loosen connections.
> 2. If required, unlock Water Distributor and remove from the mounting plate.
> 3. Store Water Distributor in a dry, frost-protected place.
> The storage location must be out of reach for children."

**Note the order: "Loosen connections" comes first — i.e. break the joints to let water out before storing.**

**Valve position on removal:** GARDENA's manuals do not state what position the valve rests in when removed or when the battery is pulled. **UNVERIFIED for Gardena.** (What *is* documented is the orientation requirement — sleeve nut up — which is about water ingress to the battery compartment, not valve state.)

### 2.2 LinkTap

Official spec page https://link-tap.com/modules/core/views/spec.client.view.html [MFR]

> "The operating water pressure range is 0.02-0.8Mpa."
> "Flow meter measurement range: 2 to 50 LPM with a measurement error of ± 5%."
> "Please do not operate the wireless water timer if environmental temperature is below 1°C."
> "The maximum temperature of the water flow is 40°C."
> "Please use 4 AA alkaline batteries. Rechargeable battery or zinc-carbon battery should be avoided."
> "Please use clear water only."

LinkTap G2S manual [MFR-REPRO] https://manuals.plus/asin/B08YW83WK5

> "In freezing climates, disconnect the water timer from the faucet and store it indoors during winter to prevent freeze damage."
> "Smart Anti-Freeze Protection: Automatically opens the valve when temperatures drop below a preset threshold to prevent pipe damage."
> "Operating Temperature: 32°F to 122°F (0°C to 50°C)"
> "Water Pressure Range: 3-120 psi"
> "4 x AA Alkaline Batteries (not included)" / "Battery Life: Up to 2 years"
> "LinkTap provides a 2-Year Warranty for the G2S Smart Water Timer & Gateway."

**LinkTap is the only one of the four with an active anti-freeze behaviour** — it opens the valve on a temperature threshold rather than just warning. That is a mitigation for a shoulder-season cold snap, **not** a substitute for winterising: the same manual still says to disconnect and store indoors.

**Valve position on removal / battery removal:** **UNVERIFIED.** The G2S manual does not state it. Note the tension: the anti-freeze feature deliberately *opens* the valve when cold, but nothing documents the resting state after power loss.

**Warranty exclusion for frost:** **UNVERIFIED as a verbatim manufacturer statement.** LinkTap publishes a 2-year warranty; I could not retrieve a primary LinkTap page expressly excluding frost damage. (Search summaries asserted it; I could not confirm it against LinkTap's own text, so it is recorded here as unverified rather than quoted.)

### 2.3 Orbit B-hyve

Orbit's own support site — this is manufacturer-primary. [MFR]
https://support.orbitonline.com/en/b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab and https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab

> "Freeze damage is not covered under our warranty."
> "Working pressure of hose timers? 10-100 PSI"
> "Flow rate of hose timers? 2.5-9 GPM"
> "2 X 1.5 v Batteries" (alkaline recommended)
> Low-battery indicator at 2.8 VDC; operation ceases at 2.6 VDC.
> On backflow: these timers have no built-in backflow preventer; users must "install an Anti-siphon Valve on the hose end".

**Flag: the flow rate spec is a serious problem for a drip build — see section 3.4.**

**Valve position on battery removal:** **UNVERIFIED** — Orbit's article does not state it. What *is* documented is the cut-off behaviour: operation ceases at 2.6 VDC, meaning a flat battery mid-cycle is a defined failure mode.

**Explicit "remove and store indoors" instruction:** **UNVERIFIED as verbatim from Orbit's own site.** The freeze-damage warranty exclusion is verbatim and primary; the removal instruction appears in Orbit-derived manual reproductions but I could not pin it to an Orbit-hosted verbatim sentence.

### 2.4 Hozelock

Hozelock 2216 Cloud Controller instruction leaflet (official Hozelock leaflet, PDF obtained and text-extracted; hozelock.com blocked direct fetch with HTTP 403, PDF retrieved from a distributor mirror of the same Hozelock document). [MFR]

> "This product is not designed to be used in sub-zero (frost) temperatures. During winter months drain any remaining water out of your timer and bring it indoors until the next watering season."

Pressure, from the same leaflet's spec block:
> "0.1 – 10 Bar"

Hozelock's shorter water-timer leaflets carry the blunter form of the same instruction: [MFR-REPRO]
> "PROTECT YOUR WATER TIMER FROM FROST. REMOVE FROM THE TAP IN WINTER. PRODUCT NOT GUARANTEED AGAINST FROST DAMAGE."
> "REMOVE BATTERIES WHEN NOT IN USE."

Hozelock is the clearest of the four: **frost damage is not guaranteed, remove from the tap, drain, bring indoors, pull the batteries.**

### 2.5 Summary table — controller winterising

| | Remove from tap? | Store indoors? | Drain? | Remove batteries? | Frost voids warranty? |
|---|---|---|---|---|---|
| Gardena | Yes ("loosen connections") | Yes, "dry, enclosed and frost-free" | Implied by loosening connections | Yes, "to preserve the battery" | **Yes** — "Damage caused by frost is not covered by the warranty" |
| LinkTap | Yes — "disconnect... and store it indoors" | Yes | Not stated verbatim | Not stated verbatim | UNVERIFIED |
| Orbit | Not verbatim on Orbit's own site | Not verbatim on Orbit's own site | Not stated | Not stated | **Yes** — "Freeze damage is not covered under our warranty" |
| Hozelock | **Yes** — "REMOVE FROM THE TAP IN WINTER" | **Yes** — "bring it indoors until the next watering season" | **Yes** — "drain any remaining water out of your timer" | **Yes** — "REMOVE BATTERIES WHEN NOT IN USE" | **Yes** — "PRODUCT NOT GUARANTEED AGAINST FROST DAMAGE" |

**Consensus across all four: take it off the tap, drain it, store it indoors, pull the batteries. Two of four state in their own words that frost damage is not covered.**

**On valve position when removed: UNVERIFIED across all four manufacturers.** None of the manuals retrieved state whether the valve rests open or closed when detached or de-powered. Practically this matters because a valve stored **closed** traps water in the body — which is the exact mechanism described in 2.7. The safe procedure regardless of documented behaviour: **run a manual watering cycle to open the valve, with the tap already turned off, before detaching.** Drip Depot describe exactly this technique for valve systems (see 2.6), and LinkTap's own anti-freeze feature works on the same principle (open the valve when cold).

### 2.6 Downstream kit: filter, pressure regulator, dripline

**Rain Bird** (manufacturer), *Winterize Your Drip Irrigation System*: https://www.rainbird.com/homeowners/blog/winterize-your-drip-irrigation-system [MFR]

> "If your system includes an automatic hose end timer, switch it to the 'off' position."
> "Open any flush caps located at low discharge points in your system" / "remove the figure-8 end caps from mainlines to drain the water." — allow "several hours for complete drainage."
> "Unscrew filters, pressure regulators and backflow preventers from the system and bring them indoors."
> "clean these components thoroughly and store them in a dry place where they won't be damaged"
> "Replace the figure-8 end caps loosely on remaining tubing. This keeps debris out while allowing space for any remaining water to expand if it freezes."
> "Don't tighten these caps completely."

**Drip Depot** technical support: https://help.dripdepot.com/support/solutions/articles/11000044363-winterizing [TRADE]

> "Turn off the main water supply for the irrigation system. Remove the timer and head assembly (backflow preventer, filter and pressure regulator) from the water source. Drain and store these components indoors."
> "Tubing can survive some freezing, but fittings will crack if standing water freezes inside them."
> "Open end caps on drip lines so that water can drain out. We recommend that you walk your mainlines and lift lines and fittings at low spots."
> "Once you are sure that all excess water has been removed from your mainlines, you can replace the caps."
> For valve/manifold systems: "run the timer/controller through its normal watering cycle after the main water supply is turned off" to relieve pressure, then "Manually open all valves to reduce the chance of standing water freezing and cracking your manifold components."

### 2.7 The trapped-water risk in the valve body

The failure mode is straightforward and is what every one of the above warnings is aimed at. A solenoid/motorised tap timer holds a sealed volume of water between its inlet seat and its outlet. If the unit is detached and stored with the valve closed, or left on the tap over winter, that water:
1. cannot drain (both ends are effectively sealed — the tap connector above, the closed diaphragm below);
2. expands ~9% on freezing;
3. splits the plastic valve body or deforms the diaphragm/solenoid.

Drip Depot state the general principle verbatim: **"Tubing can survive some freezing, but fittings will crack if standing water freezes inside them."** [TRADE] Rain Bird's loose-end-cap instruction — **"allowing space for any remaining water to expand if it freezes"** [MFR] — is the same physics applied to the dripline: leave the system a route to expand into.

Gardena's Art. 1197 instruction likewise leads with **"1. Loosen connections."** before storage [MFR], which is the same mitigation at the fitting level.

**Practical winterising sequence for this build:**
1. Turn the tap off (and the indoor isolator, if there is one).
2. Run a manual watering cycle from HA so the valve motors **open** and the line depressurises.
3. Unscrew the timer from the tap; shake it out; leave the valve in the open state if you can.
4. Unscrew the filter, pressure regulator and any Type DB; drain and clean them.
5. Open the dripline end caps, walk the lines lifting them at low spots, let it drain for several hours.
6. Refit end caps **loosely** — debris out, expansion room in.
7. Pull the batteries from the timer.
8. Store timer, filter, regulator and DB together in a dry frost-free place indoors.

The one item that stays outdoors is the LDPE dripline itself, which tolerates freezing as long as it is drained and the caps are loose.

**One regulatory footnote that intersects here:** G15.20 requires the DCV to be **"located inside a building and protected from freezing"** [GUIDANCE]. If the compliance DCV is a Type HA screwed onto the outside tap outlet rather than an indoor in-line valve, it is itself a frost casualty waiting to happen — and unlike the timer it is not supposed to be removed each autumn. That is an argument for the indoor DCV route in G15.21(a) over the bolt-on options.

---

## 3. Mounting and plumbing mechanics

### 3.1 Feeding the timer from a two-way tap splitter

**No manufacturer prohibition found. UNVERIFIED that any manufacturer forbids it — and there is affirmative manufacturer endorsement of the arrangement.**

**Gardena** sell a Twin-Tap Connector (Art. 8193-20) explicitly marketed as a "connection option for 2 devices to the tap, suitable for Gardena irrigation computers and clocks", and sell bundle SKUs pairing a Water Computer with the Twin-Tap Connector. [MFR, product listing rather than manual — the manual text for the connector itself was not retrievable]

**Raindrip** state it plainly for their Y Connector (3/4" FHT × 3/4" MHT): [MFR] https://www.raindrip.com/products/control/y-connector-3-4-in-fht-3-4-in-mht

> "use one spigot to attach an automatic timer and other parts of your drip system; use the other spigot to attach garden hose"

> the splitter "converts one faucet into two separately controllable spigot outlets with dual shut-off valves"

So a splitter feeding a timer is a manufacturer-anticipated arrangement, not an abuse of one.

**The caveats that are documented:**

Gardena, on orientation — this is the constraint a splitter can break: [MFR-REPRO]
> "The Water Control may only be set up vertically with the sleeve nut to the top to prevent water from penetrating into the battery compartment."

A Y-splitter that presents its outlets at an angle, or a splitter whose outlet points sideways, can hang the timer off-vertical and defeat that requirement. **This is the real risk of splitter-mounting a Gardena unit, and it is a documented one** — water gets into the battery compartment. Choose a splitter whose outlets point straight down, or accept a short flexible hose tail between splitter and timer so the timer can hang vertically.

Hozelock, on positioning: [MFR-REPRO]
> the controller is designed to be positioned "directly underneath an outdoor tap"
> "threaded water connections are suitable for hand tightening only"

### 3.2 A rigid threaded stack hanging off the outlet

**No manufacturer statement found either permitting or prohibiting a rigid filter + regulator stack on a tap timer's outlet. UNVERIFIED.** This is a genuine gap — none of Gardena, LinkTap, Orbit or Hozelock addresses the cantilevered-load case in the manuals retrieved.

The closest documented manufacturer statements:

Gardena: [MFR-REPRO]
> "Avoid tensile strain. Do not pull the hose connected to the Water Control."

Hozelock: [MFR-REPRO]
> "threaded water connections are suitable for hand tightening only"

Trade guidance on the failure modes, from Drip Depot: [TRADE] https://help.dripdepot.com/support/solutions/articles/11000061451-troubleshooting-leaking-in-my-system

> "Over tightening hose threaded parts can deform the rubber washer seal and cause leaking, plus over tightening of plastic parts may cause cracks that cause leaking as well."

> mixing thread standards is a distinct failure: do not connect "hose thread (MHT or FHT) to pipe thread (FPT or MPT)"

And on supporting heavy assemblies: [TRADE]
> "Heavy parts can be installed on the ground or a small platform."

**Assessment.** The two documented cracking mechanisms are (a) over-tightening plastic threads and (b) mixing MHT/FHT hose thread with FPT/MPT pipe thread — the latter is insidious because the threads engage a couple of turns and feel fine, then split under load. Neither is about weight per se. But Hozelock's "hand tightening only" plus Gardena's "avoid tensile strain" together imply these plastic hose-thread joints are not designed as structural connections. A brass filter and regulator stack cantilevered off a plastic timer outlet, with the whole assembly's mass and the leverage of a 150–200 mm lever arm bearing on a hand-tightened plastic thread, is outside anything the manuals contemplate.

**Recommendation (engineering judgement, not sourced):** break the rigid stack with a short flexible hose tail immediately after the timer, and support the filter/regulator/Type DB assembly independently — a board or bracket on the wall, or Drip Depot's "small platform". This also happens to suit the Type DB's requirement to sit 300 mm above the dripline and discharge vertically downwards, which needs its own mounting anyway.

### 3.3 Minimum operating pressure

| Manufacturer | Min pressure | Max | Source |
|---|---|---|---|
| Gardena Water Control Select / smart Water Control | **0.5 bar** | 12 bar | [MFR-REPRO] manuals.plus 1891 / smart Water Control |
| Gardena Water Distributor automatic 1197 | **1 bar** | 6 bar | [MFR] Art. 1197 operating instructions, §9 Technical Data |
| LinkTap | **0.02 MPa (0.2 bar / ~3 psi)** | 0.8 MPa (8 bar) | [MFR] link-tap.com spec page |
| Orbit B-hyve | **10 PSI (~0.7 bar)** | 100 PSI | [MFR] support.orbitonline.com |
| Hozelock 2216 Cloud Controller | **0.1 bar** | 10 bar | [MFR] 2216 leaflet |

UK mains pressure is typically well above all of these, so **minimum pressure is unlikely to be the binding constraint**. The exception is if a pressure regulator upstream of the timer drops the pressure — which is why regulators belong downstream (see 3.5).

### 3.4 Minimum FLOW RATE — this is the real risk for a ~100 L/h drip system

**This is the most consequential finding in section 3.** Several tap timers specify a minimum *flow*, not just a minimum pressure, and a low-flow drip system can fall below it.

**Gardena Water Control (tap timer), verbatim:** [MFR-REPRO]
> "The minimum water output to ensure that the Water Control functions correctly is 20 – 30 l/h."

**Gardena Water Distributor automatic Art. 1197, verbatim** from the operating instructions PDF: [MFR]
> "For secure switching function of the Water Distributor, the minimum water discharge quantity is 20 l / h. E.g. for control of the Micro-Drip System, a minimum of 10 two-litre Drip Heads is required."
> §9 Technical Data: "Minimum flow: 20 l / h"
> §2 Safety instructions: "The minimum water pressure for secure switching operation during irrigation is 1 bar. If too many devices are connected to one line, the pressure may fall below 1 bar and will be insufficient for proper operation."
> Troubleshooting table: "Water Distributor does not switch further | Pressure is under 1 bar. | v Clean filter, use Tap Connector Art. 2801 / 2817 with ³⁄₄" hoses on the inlet side, reduce water consumption on the dispensing device."

**Orbit B-hyve, verbatim:** [MFR]
> "Flow rate of hose timers? 2.5-9 GPM"

**2.5 GPM is approximately 568 L/h.** A drip system running at ~100 L/h is **roughly one-fifth of the bottom of Orbit's stated range**. Even read charitably as a measurement/design range rather than a hard minimum, that is a very large margin outside spec, and Orbit publish no drip/low-flow guidance to soften it. **Orbit B-hyve is the highest-risk choice of the four for a 100 L/h drip system.**

**LinkTap:** the *valve* has no stated minimum flow, but the integrated **flow meter** does: [MFR]
> "Flow meter measurement range: 2 to 50 LPM"

**2 LPM is 120 L/h.** A system at ~100 L/h sits **below the bottom of LinkTap's flow-meter range**. The valve should still actuate — LinkTap's minimum pressure is only 0.2 bar — but **volume-based watering, flow-based fault detection and leak alarms are the features most likely to misbehave at 100 L/h**, because the measurement is out of range. For a build that wants HA to reason about litres delivered, that is a material limitation: you would be scheduling by duration, not volume, and the "real-time fault detection" headline feature would be operating below its specified range.

**Gardena at ~100 L/h is comfortably fine** (needs 20–30 L/h). Hozelock publish a pressure range but no minimum flow in the leaflet retrieved — **UNVERIFIED for Hozelock**.

### 3.5 Consequence of falling below minimum flow — the valve fails to CLOSE

The failure mode is specific and worth stating precisely, because it is the dangerous one: the valve fails **open**, not closed.

**Drip Depot / DripWorks technical support, verbatim:** [TRADE] https://www.dripworks.com/resources/faq/troubleshooting
> "Timers with a diaphragm need a minimum flow and pressure to operate correctly, usually 30 gph and 15 psi."
> "To test this, open the end of your mainline and, if the timer shuts off when it is supposed to, you know you do not have enough water flowing through your system."

Search-result paraphrase of the same trade guidance (not quoted as verbatim): a surge on start-up can open the timer, but once flow and pressure drop back to the drip system's low steady state, the diaphragm lacks the differential pressure needed to reseat, and **it will not close when scheduled**.

**Mechanism:** a diaphragm valve is not motor-driven shut. The solenoid or motor vents a pilot chamber; **line pressure differential** then pushes the diaphragm onto its seat. At very low flow the pressure drop across the diaphragm is too small to seat it. The valve stays cracked open and the garden waters continuously. Gardena's own troubleshooting entry — "Water Distributor does not switch further | Pressure is under 1 bar" [MFR] — is the same failure in their multi-zone unit, and their remedy is telling: **"reduce water consumption on the dispensing device"** is *not* the fix; the fix is more inlet pressure and a cleaner filter.

**Risk for a smart build:** HA will report the valve as closed (it sent the close command and got an acknowledgement) while water continues to flow. This is exactly the class of failure where a control system's own state is not evidence — the readback comes from the controller's intent, not from the valve seat. **A flow sensor or a water meter reading is the only thing that can disconfirm it.** Note the trap: on LinkTap, the built-in flow meter that would catch this is itself below its specified range at 100 L/h.

**Mitigations:**
- Prefer a **motorised ball valve** design over a diaphragm design for very low flow (LinkTap and Gardena's tap units are motor-driven; Orbit's hose timers and most inline solenoid valves are diaphragm/pilot-operated).
- Size the drip run upward if you can — Gardena's own worked example is instructive: "for control of the Micro-Drip System, a minimum of 10 two-litre Drip Heads is required".
- Run the Drip Depot test after install: open the mainline end so flow is high, and confirm the timer shuts off on schedule. If it shuts off at high flow but not at normal drip flow, the diagnosis is confirmed.
- Instrument it — a separate flow or pressure sensor downstream, reported to HA, so "closed" is a measurement rather than an assumption.

### 3.6 Where the pressure regulator must go

**Drip Depot, verbatim:** [TRADE] https://help.dripdepot.com/support/solutions/articles/11000044625-drip-irrigation-pressure-regulators-faq
> Regulators must be positioned "on the outflow side of any timers or valves".
> They are "not rated for constant pressure".
> "Pressure regulators need outflow and back pressure to regulate the system."

Recommended component order, from the same source: **timer → backflow preventer → filter → pressure regulator → tubing adapter.** Rain Bird's winterising article implies the same head-assembly ordering.

**Two conflicts to resolve in this build:**
1. Drip Depot put the backflow preventer *after* the timer. The UK Type DB must also be after the timer ("no control valves on the outlet of the device") — consistent. But the UK DCV must be *before* everything, ideally indoors (G15.20). So the UK stack is: **indoor DCV → tap → timer → filter → regulator → Type DB (300 mm high, pointing down) → dripline.**
2. A regulator placed *before* the timer would both violate the "not rated for constant pressure" rule (it would be held under static pressure whenever the timer is shut) and risk dropping inlet pressure below the timer's minimum — Gardena's 1 bar on the Water Distributor, or the 15 psi diaphragm figure. **Regulator downstream, always.**

---

## Open items / UNVERIFIED

- **Valve resting position when a tap timer is detached or its batteries removed** — not documented by Gardena, LinkTap, Orbit or Hozelock in any manual retrieved. Mitigate by manually opening the valve before detaching.
- **LinkTap frost warranty exclusion** — asserted in secondary summaries; not confirmed against LinkTap's own text.
- **Orbit verbatim "remove and store indoors" instruction on Orbit's own domain** — only the freeze-damage warranty exclusion is verbatim-primary.
- **Hozelock minimum flow rate** — the 2216 leaflet gives pressure (0.1–10 bar) but no minimum flow.
- **Buried dripline in a domestic garden** — no clause expressly on point. FC4 is the defensible reading; FC5 is arguable from Table 6.1e's "laid below or at ground level" phrasing if an undertaker chooses to read the domestic carve-out narrowly.
- **Manufacturer guidance on cantilevered loads on a tap timer outlet** — no manufacturer addresses it. The support recommendation in 3.2 is engineering judgement, not a sourced requirement.
- The Defra guidance PDF used here is the version of the document first published 22 December 1999 and reproduced by a third party (hotun.co.uk). WRAS's own *Water Regulations Guide* is the commercially published equivalent and was not obtained; **the current WRAS/water-undertaker interpretation should be confirmed with the local undertaker as part of the Regulation 5 notification anyway**, which conveniently resolves any residual ambiguity in writing.

## Sources

- [The Water Supply (Water Fittings) Regulations 1999 — Regulation 5](https://www.legislation.gov.uk/uksi/1999/1148/regulation/5/made)
- [The Water Supply (Water Fittings) Regulations 1999 — Schedule 1](https://www.legislation.gov.uk/uksi/1999/1148/schedule/1/made)
- [Defra Guidance Document to Schedules 1 and 2 (PDF)](https://hotun.co.uk/wp-content/uploads/2021/03/waterregs99-guidance.pdf)
- [WaterSafe — outside taps and double check valves](https://www.watersafe.org.uk/advice/weather-hacks/)
- [LWS Irrigation — water regulations interpretation (PDF)](https://www.lws.uk.com/images/uploaded/Resources/Technical-Documents/water-regulations.pdf)
- [Orbit B-hyve hose timer general knowledge](https://support.orbitonline.com/en/b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab)
- [Orbit Gen 2 B-hyve hose timer general knowledge](https://support.orbitonline.com/en/gen-2-b-hyve-smart-hose-watering-timer/Hose-Timer-General-Knowledge-fcab)
- [LinkTap technical specification](https://link-tap.com/modules/core/views/spec.client.view.html)
- [LinkTap G2S manual](https://manuals.plus/asin/B08YW83WK5)
- [GARDENA 1891 Water Control Select manual](https://manuals.plus/gardena/1891-water-control-select-timer-manual)
- [GARDENA smart Water Control manual](https://manuals.plus/gardena/smart-water-control-system-manual)
- [GARDENA Water Distributor automatic Art. 1197 operating instructions (PDF)](https://manuals.plus/m/82f6c418f9a86659a90c16d8a6f387ab62fdba4cffdca047412fc1fe4f7a8d5a_optim.pdf)
- [Hozelock 2216 Cloud Controller instruction leaflet (PDF)](https://s.skbv.se/store/files/Monteringsanvisning%20650597.pdf)
- [Rain Bird — Winterize Your Drip Irrigation System](https://www.rainbird.com/homeowners/blog/winterize-your-drip-irrigation-system)
- [Drip Depot — Winterizing](https://help.dripdepot.com/support/solutions/articles/11000044363-winterizing)
- [Drip Depot — Pressure regulators FAQ](https://help.dripdepot.com/support/solutions/articles/11000044625-drip-irrigation-pressure-regulators-faq)
- [Drip Depot — Troubleshooting leaks](https://help.dripdepot.com/support/solutions/articles/11000061451-troubleshooting-leaking-in-my-system)
- [DripWorks — Troubleshooting](https://www.dripworks.com/resources/faq/troubleshooting)
- [Raindrip Y Connector 3/4" FHT × 3/4" MHT](https://www.raindrip.com/products/control/y-connector-3-4-in-fht-3-4-in-mht)
