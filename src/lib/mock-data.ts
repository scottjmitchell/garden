import type { Phase, Material, BudgetItem, JournalSlot, Zone } from '../types'

// ─── Phases ──────────────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  {
    id: 'phase0', num: '0', title: 'Preparation', date: 'Current — March 2026', status: 'current',
    tasks: [
      { id: 'p0t1', text: 'Apply weedkiller to existing lawn',                               done: true  },
      { id: 'p0t2', text: 'Break concrete in right seating zone',                            done: true  },
      { id: 'p0t3', text: 'Measure side gate width (mini-digger needs 800mm+ clearance)',    done: false },
      { id: 'p0t4', text: 'Mark out zones with spray paint / hose pipe',                    done: false },
      { id: 'p0t5', text: 'Order skip hire (~8 yard)',                                       done: false },
      { id: 'p0t6', text: 'Source and order pergola',                                        done: false },
      { id: 'p0t7', text: 'Source and order natural stone paving',                           done: false },
      { id: 'p0t8', text: 'Check left fence post depth before raising lawn level',           done: false },
    ],
  },
  {
    id: 'phase1', num: '1', title: 'Groundworks', date: 'April 2026', status: 'upcoming',
    tasks: [
      { id: 'p1t1', text: 'Hire mini-digger (half to full day, tracked machine)',                            done: false },
      { id: 'p1t2', text: 'CUT right patio zone: excavate ~300–450mm to reach patio datum level',          done: false },
      { id: 'p1t3', text: 'FILL left/lawn zone with spoil from right side cut',                             done: false },
      { id: 'p1t4', text: 'Rotovate lawn zone (2 passes at 90°), remove all root material',                done: false },
      { id: 'p1t5', text: 'Establish finished levels: string lines from deck datum (0.00m)',                done: false },
      { id: 'p1t6', text: 'Connect to existing drains (back-right, between concrete pads)',                 done: false },
      { id: 'p1t7', text: 'Install linear channel drain at patio edge',                                     done: false },
    ],
  },
  {
    id: 'phase2', num: '2', title: 'Hard Landscaping', date: 'May 2026', status: 'upcoming',
    tasks: [
      { id: 'p2t1', text: 'Dig pergola post footings: 4× pads, 450×450×700mm deep, C20 concrete',         done: false },
      { id: 'p2t2', text: 'Wait 7 days minimum for footings to cure',                                      done: false },
      { id: 'p2t3', text: 'Lay patio subbase: 150mm compacted MOT Type 1 hardcore (~50 sqm)',             done: false },
      { id: 'p2t4', text: 'Run SWA armoured cable conduit BEFORE paving (outbuilding to pergola)',         done: false },
      { id: 'p2t5', text: 'Lay natural stone paving: full wet mortar bed (1:5 sand/cement, 50mm bed)',    done: false },
      { id: 'p2t6', text: 'Install EverEdge 3mm galvanised steel lawn edging at curved boundary',         done: false },
      { id: 'p2t7', text: 'Point paving with flexible exterior pointing mortar',                           done: false },
      { id: 'p2t8', text: 'Install right-boundary fence/privacy screen panels',                            done: false },
    ],
  },
  {
    id: 'phase3', num: '3', title: 'Structures', date: 'June 2026', status: 'upcoming',
    tasks: [
      { id: 'p3t1', text: 'Erect pergola',                                                                  done: false },
      { id: 'p3t2', text: 'Install 4× large raised planters',                                             done: false },
      { id: 'p3t3', text: 'Wire electricity: outbuilding fusebox → pergola lights + outdoor socket',       done: false },
      { id: 'p3t4', text: 'Build/position new shed in back-right corner',                                  done: false },
      { id: 'p3t5', text: 'Lay shingle ground cover around new shed zone (Zone 4)',                       done: false },
    ],
  },
  {
    id: 'phase4', num: '4', title: 'Soft Landscaping', date: 'June–July 2026', status: 'upcoming',
    tasks: [
      { id: 'p4t1', text: 'Add 100mm topsoil + compost across lawn zone',                                  done: false },
      { id: 'p4t2', text: 'Final fine levelling, raking and treading for turf',                            done: false },
      { id: 'p4t3', text: 'Lay turf (irrigate daily for 3 weeks)',                                         done: false },
      { id: 'p4t4', text: 'Existing cherry tree: stake if needed, mulch ring 1m diameter',                done: false },
      { id: 'p4t5', text: "Plant clematis montana 'Alba' × 2 at pergola base",                          done: false },
      { id: 'p4t6', text: 'Plant hydrangea petiolaris on back fence (if chosen)',                          done: false },
      { id: 'p4t7', text: 'Plant border shrubs and perennials',                                             done: false },
    ],
  },
  {
    id: 'phase5', num: '5', title: 'Finishing', date: 'July–August 2026', status: 'upcoming',
    tasks: [
      { id: 'p5t1', text: 'Install pergola LED lighting (IP65 rated)',                                      done: false },
      { id: 'p5t2', text: "Install children's swing set on lawn (rubber safety tiles beneath)",             done: false },
      { id: 'p5t3', text: 'Lay bark mulch in border beds',                                                  done: false },
      { id: 'p5t4', text: 'Install outdoor corner sofa set + furniture',                                    done: false },
      { id: 'p5t5', text: 'Final landscaping touches and photography',                                      done: false },
    ],
  },
]

// ─── Materials ───────────────────────────────────────────────────────────────

export const MATERIALS: Material[] = [
  {
    id: 'paving', name: 'Paving Slabs', accent: '#8B9A8E', status: 'researching',
    spec: 'Indian sandstone Raj Green (riven, calibrated 18–22mm) is the best value. ~40 sqm + 10% wastage. Key checks: calibrated, min 22mm, R11 slip rating, single batch.',
    low: 960, high: 1080,
    options: [],
  },
  {
    id: 'pergola', name: 'Pergola (4×3m)', accent: '#C8922A', status: 'researching',
    spec: 'Timber preferred — leave natural/untreated. Options: (1) Self-build from sawn timber. (2) Flatpack kit — Waltons 3×4m (~£500 on sale). Motorised louvred aluminium remains a future upgrade.',
    low: 310, high: 800,
    options: [],
  },
  {
    id: 'mot', name: 'MOT Type 1 Hardcore', accent: '#6B5C47', status: 'to-order',
    spec: '~8 tonnes for 50 sqm patio at 150mm depth. Source from local builders merchant.',
    low: 400, high: 600,
    options: [],
  },
  {
    id: 'planters', name: 'Raised Planters (×4) — DIY Timber', accent: '#8B4513', status: 'to-order',
    spec: 'DIY build from pressure-treated timber. Target size 1500×600×400mm. Stain dark. Much cheaper than pre-made steel.',
    low: 120, high: 240,
    options: [],
  },
  {
    id: 'edging', name: 'EverEdge Lawn Edging', accent: '#5C7A5C', status: 'to-order',
    spec: '3mm galvanised steel, 150mm deep, ~30 linear metres. Install at same time as paving, 5–10mm below finished turf level.',
    low: 300, high: 400,
    options: [],
  },
  {
    id: 'swa', name: 'Armoured SWA Cable', accent: '#7A6B3A', status: 'to-order',
    spec: '2.5mm² 3-core SWA, 15–20m run. 20mm MDPE conduit, cable clips, weatherproof IP65 socket. Bury at 450mm depth minimum.',
    low: 150, high: 250,
    options: [],
  },
  {
    id: 'plants', name: 'Star Jasmine + Clematis', accent: '#5C7A5C', status: 'to-order',
    spec: "NWW facing (afternoon/evening sun) — star jasmine strongly recommended. Trachelospermum jasminoides × 1–2 (pergola), Clematis montana 'Alba' × 1 (fast coverage).",
    low: 50, high: 120,
    options: [],
  },
  {
    id: 'furniture', name: 'Outdoor Corner Sofa', accent: '#8B9A8E', status: 'researching',
    spec: 'PE rattan/aluminium frame, charcoal, Olefin fabric cushions with fitted weatherproof cover. Suitable for year-round outdoor storage.',
    low: 1200, high: 2500, options: [],
  },
  {
    id: 'swing', name: "Children's Swing Set", accent: '#4A6B8B', status: 'researching',
    spec: 'Blue steel, EN71 compliant, hot-dip galvanised. Add rubber safety tiles beneath.',
    low: 200, high: 500, options: [],
  },
  {
    id: 'shed', name: 'New Shed', accent: '#6B5C3A', status: 'researching',
    spec: 'Approx 2×2m or 2×3m — size to confirm. Position in back-right corner (Zone 4). Gravel/shingle ground cover surrounding area.',
    low: 500, high: 1000, options: [],
  },
  {
    id: 'trellis', name: 'Right Fence Trellis', accent: '#8B9A8E', status: 'researching',
    spec: '', low: 0, high: 0, options: [],
  },
  {
    id: 'shingle', name: 'Shingle', accent: '#8B9A8E', status: 'researching',
    spec: '', low: 0, high: 0, options: [],
  },
  {
    id: 'turf', name: 'Turf', accent: '#8B9A8E', status: 'researching',
    spec: '', low: 0, high: 0, options: [],
  },
  {
    id: 'fence-trees', name: 'Fence Trees', accent: '#8B9A8E', status: 'researching',
    spec: '', low: 0, high: 0, options: [],
  },
]

// ─── Budget ──────────────────────────────────────────────────────────────────

export const BUDGET_ITEMS: BudgetItem[] = [
  { id: 'paving',     name: 'Natural Stone Paving (~50 sqm)',            low: 3500, high: 4500 },
  { id: 'pergola',    name: 'Louvred Pergola (motorised aluminium)',      low: 3500, high: 5500 },
  { id: 'mot',        name: 'MOT Type 1 Hardcore (~8 tonnes)',            low:  400, high:  600 },
  { id: 'planters',   name: 'Raised Planters (×4)',                        low:  200, high:  400 },
  { id: 'edging',     name: 'EverEdge Lawn Edging (~30 lin. m)',          low:  300, high:  400 },
  { id: 'swa',        name: 'SWA Armoured Cable + Electrics',             low:  150, high:  250 },
  { id: 'plants',     name: 'Clematis montana + Hydrangea petiolaris',    low:   50, high:  120 },
  { id: 'furniture',  name: 'Outdoor Corner Sofa Set',                    low: 1200, high: 2500 },
  { id: 'swing',      name: "Children's Swing Set + Safety Tiles",        low:  250, high:  550 },
  { id: 'shed',       name: 'New Shed (2×2m – 2×3m)',                    low:  500, high: 1000 },
  { id: 'turf',       name: 'Turf + Topsoil + Compost',                  low:  400, high:  700 },
  { id: 'skip',       name: 'Skip Hire (~8 yard)',                        low:  300, high:  450 },
  { id: 'digger',     name: 'Mini-Digger Hire (1 day)',                   low:  280, high:  420 },
  { id: 'lights',     name: 'Pergola LED Lighting (IP65)',                low:  200, high:  400 },
  { id: 'shingle',    name: 'Bark Mulch + Shingle Ground Cover',          low:  150, high:  280 },
  { id: 'breaker',    name: 'Breaker Hire (2 weekends)',                  low:  172, high:  172 },
  { id: 'weedkiller', name: 'Weedkiller',                                low:   30, high:   60 },
  { id: 'fence-trellis', name: 'Right Fence Trellis',                   low:    0, high:    0 },
]

// ─── Journal ─────────────────────────────────────────────────────────────────

export const JOURNAL_SLOTS: JournalSlot[] = [
  { id: 'before',      label: 'Before — Current State',        phase: 'Phase 0' },
  { id: 'groundworks', label: 'Groundworks — Dig & Level',     phase: 'Phase 1' },
  { id: 'paving',      label: 'Hard Landscaping — Paving',     phase: 'Phase 2' },
  { id: 'pergola',     label: 'Structures — Pergola Erected',  phase: 'Phase 3' },
  { id: 'turf',        label: 'Soft Landscaping — Turf Laid',  phase: 'Phase 4' },
  { id: 'finished',    label: 'Finished — Summer 2026',        phase: 'Phase 5' },
]

// ─── Map zones ───────────────────────────────────────────────────────────────

export const ZONES: Zone[] = [
  {
    id: 'zone1',
    title: 'Zone 1 — Stone Patio + Pergola',
    desc: '~50 sqm natural stone setts. 4×3m louvred aluminium pergola (motorised, anthracite). Raised corten planters along right fence. SWA cable from outbuilding for lights + socket.',
  },
  {
    id: 'zone2',
    title: 'Zone 2 — Curved Lawn',
    desc: 'Level lawn (cut-and-fill). EverEdge steel edging on sweeping curved boundary. Turf June–July 2026. Swing set on left.',
  },
  {
    id: 'zone3',
    title: 'Left Fence Border',
    desc: 'Thin planted border strip along left fence line. Minimal — lawn runs almost to the fence.',
  },
  {
    id: 'zone4',
    title: 'Zone 4 — Shed + Shingles',
    desc: 'New shed (2×2m–2×3m, TBD) in back-right corner. Shingle ground cover. Existing drain between here and patio — keep accessible.',
  },
]
