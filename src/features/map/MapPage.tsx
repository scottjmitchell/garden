import { useState } from 'react'
import { PageHeader } from '../../design-system'
import { ZONES } from '../../lib/mock-data'

export function MapPage() {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const zone = ZONES.find(z => z.id === activeZone) ?? null

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div>
      <PageHeader title="Map" subtitle="Garden plan — hover a zone for details" />

      {activeZone && zone && (
        <div
          data-testid="map-tooltip"
          className="pointer-events-none fixed z-50 w-56 rounded border border-white/10 bg-[#1c2017] p-3 shadow-xl"
          style={{
            left: mousePos.x + 16,
            top:  mousePos.y - 8,
            transform: 'translateY(-50%)',
          }}
        >
          <p className="font-display text-sm text-amber">{zone.title}</p>
          <p className="mt-1 text-xs text-garden-text/60">{zone.desc}</p>
        </div>
      )}

      <div className="relative mx-auto max-w-sm">
        <svg
          id="garden-svg"
          viewBox="0 0 450 1000"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "'Jost', sans-serif" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveZone(null)}
        >
          <defs>
            <pattern id="hatch-stone" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#8B9A8E" strokeWidth="0.5" opacity="0.4"/>
            </pattern>
            <pattern id="hatch-deck" patternUnits="userSpaceOnUse" width="14" height="14">
              <line x1="0" y1="7" x2="14" y2="7" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.3"/>
            </pattern>
            <pattern id="dots-shingle" patternUnits="userSpaceOnUse" width="8" height="8">
              <circle cx="4" cy="4" r="0.8" fill="#8B9A8E" opacity="0.4"/>
            </pattern>
            <pattern id="hatch-border" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(135)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#4A5C47" strokeWidth="0.6" opacity="0.5"/>
            </pattern>
            <pattern id="sett-paving" patternUnits="userSpaceOnUse" width="40" height="24">
              <rect x="0"   y="0"  width="19" height="11" rx="0.5" fill="none" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.35"/>
              <rect x="21"  y="0"  width="19" height="11" rx="0.5" fill="none" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.35"/>
              <rect x="-10" y="13" width="19" height="11" rx="0.5" fill="none" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.35"/>
              <rect x="11"  y="13" width="19" height="11" rx="0.5" fill="none" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.35"/>
              <rect x="32"  y="13" width="19" height="11" rx="0.5" fill="none" stroke="#8B9A8E" strokeWidth="0.6" opacity="0.35"/>
            </pattern>
            <clipPath id="patio-clip">
              <path d="M 265 248 L 420 248 L 420 900 L 30 900 L 30 820 L 265 820 C 265 820, 268 800, 278 730 C 292 560, 292 370, 265 248 Z"/>
            </clipPath>
          </defs>

          {/* Background */}
          <rect width="450" height="1000" fill="#1a1d18"/>
          <rect width="450" height="1000" fill="url(#hatch-stone)" opacity="0.06"/>
          <rect x="30" y="30" width="390" height="940" rx="2" fill="none" stroke="#8B9A8E" strokeWidth="1.5" opacity="0.5"/>

          {/* Zone 4 — Shed + Shingles */}
          <g data-zone="zone4" onMouseEnter={() => setActiveZone('zone4')} style={{ cursor: 'pointer' }}>
            <rect x="268" y="50" width="152" height="190" rx="1" fill="#1e201c" stroke="#5a6b57" strokeWidth="0.8" opacity="0.9"/>
            <rect x="268" y="50" width="152" height="190" fill="url(#dots-shingle)" opacity="0.8"/>
            <rect x="340" y="58"  width="72" height="60" rx="2" fill="#2a2f26" stroke="#8B9A8E" strokeWidth="1.2"/>
            <line x1="340" y1="88" x2="412" y2="88" stroke="#8B9A8E" strokeWidth="0.5" opacity="0.5"/>
            <line x1="376" y1="58" x2="376" y2="118" stroke="#8B9A8E" strokeWidth="0.5" opacity="0.5"/>
            <rect x="360" y="92" width="20" height="24" rx="1" fill="none" stroke="#8B9A8E" strokeWidth="0.8" opacity="0.6"/>
            <text x="376" y="56"  fill="#8B9A8E" fontSize="8" opacity="0.7" textAnchor="middle">Shed</text>
            <circle cx="300" cy="172" r="7" fill="none" stroke="#4A7A8A" strokeWidth="1" opacity="0.7"/>
            <circle cx="300" cy="172" r="3" fill="none" stroke="#4A7A8A" strokeWidth="0.8" opacity="0.7"/>
            <line x1="293" y1="172" x2="307" y2="172" stroke="#4A7A8A" strokeWidth="0.6" opacity="0.7"/>
            <line x1="300" y1="165" x2="300" y2="179" stroke="#4A7A8A" strokeWidth="0.6" opacity="0.7"/>
            <text x="311" y="176" fill="#4A7A8A" fontSize="7" opacity="0.8">Drain</text>
            <text x="344" y="210" fill="#8B9A8E" fontSize="9.5" fontWeight="500" letterSpacing="0.08em" textAnchor="middle" opacity="0.7">ZONE 4</text>
            <text x="344" y="224" fill="#8B9A8E" fontSize="8" textAnchor="middle" opacity="0.5">Shed + Shingles</text>
          </g>

          {/* Outbuilding */}
          <rect x="52" y="52" width="218" height="80" rx="1" fill="#252920" stroke="#8B9A8E" strokeWidth="1.2"/>
          <line x1="52" y1="92" x2="270" y2="92" stroke="#8B9A8E" strokeWidth="0.5" opacity="0.4"/>
          <rect x="148" y="62" width="35" height="55" rx="1" fill="none" stroke="#8B9A8E" strokeWidth="0.8" opacity="0.6"/>
          <text x="163" y="78"  fill="#C8922A" fontSize="13" opacity="0.9" textAnchor="middle">⚡</text>
          <text x="161" y="146" fill="#8B9A8E" fontSize="8"  opacity="0.7" textAnchor="middle">Outbuilding</text>

          {/* Cherry tree */}
          <circle cx="95" cy="218" r="40" fill="#2a1f14" stroke="#5C4033" strokeWidth="0.8" opacity="0.85"/>
          <circle cx="95" cy="218" r="24" fill="#1a2118" stroke="#4A5C47" strokeWidth="1.2" opacity="0.9"/>
          <line x1="95" y1="242" x2="95" y2="255" stroke="#5C4033" strokeWidth="2" opacity="0.8"/>
          <text x="95" y="268" fill="#6B7E67" fontSize="8" textAnchor="middle" opacity="0.8">Cherry Tree</text>

          {/* Left border */}
          <rect x="30" y="200" width="22" height="700" rx="1" fill="#1e231c" stroke="#4A5C47" strokeWidth="0.6" opacity="0.7"/>
          <rect x="30" y="200" width="22" height="700" fill="url(#hatch-border)" opacity="0.4"/>

          {/* Zone 2 — Curved Lawn */}
          <g data-zone="zone2" onMouseEnter={() => setActiveZone('zone2')} style={{ cursor: 'pointer' }}>
            <path d="M 52 248 L 265 248 C 292 370, 292 560, 278 730 C 268 800, 265 820, 265 820 L 52 820 Z"
                  fill="#1f2b1c" stroke="none" opacity="0.95"/>
            <path d="M 52 248 L 265 248 C 292 370, 292 560, 278 730 C 268 800, 265 820, 265 820 L 52 820 Z"
                  fill="url(#hatch-stone)" opacity="0.08" pointerEvents="none"/>
            <path d="M 265 248 C 292 370, 292 560, 278 730 C 268 800, 265 820, 265 820"
                  fill="none" stroke="#6B7E67" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.55"/>
            <text x="158" y="555" fill="#6B7E67" fontSize="11" fontWeight="500" letterSpacing="0.1em" textAnchor="middle" opacity="0.8">ZONE 2</text>
            <text x="158" y="573" fill="#6B7E67" fontSize="9"  textAnchor="middle" opacity="0.6">Curved Lawn</text>
            {/* Swing set */}
            <g transform="translate(142, 490)" opacity="0.8">
              <line x1="0" y1="0" x2="28" y2="0" stroke="#8B9A8E" strokeWidth="1.2"/>
              <line x1="5" y1="0" x2="0"  y2="20" stroke="#8B9A8E" strokeWidth="1"/>
              <line x1="23" y1="0" x2="28" y2="20" stroke="#8B9A8E" strokeWidth="1"/>
              <rect x="9" y="20" width="10" height="4" rx="1" fill="#8B9A8E" opacity="0.6"/>
              <text x="14" y="37" fill="#6B7E67" fontSize="7" textAnchor="middle">Swing</text>
            </g>
          </g>

          {/* Zone 1 — Patio + Pergola */}
          <g data-zone="zone1" onMouseEnter={() => setActiveZone('zone1')} style={{ cursor: 'pointer' }}>
            <path d="M 265 248 L 420 248 L 420 900 L 30 900 L 30 820 L 265 820 C 265 820, 268 800, 278 730 C 292 560, 292 370, 265 248 Z"
                  fill="#1e2018" stroke="none" opacity="0.95"/>
            <rect x="28" y="246" width="395" height="657" fill="url(#sett-paving)" clipPath="url(#patio-clip)" opacity="0.9"/>
            <path d="M 265 248 L 420 248 L 420 900 L 30 900 L 30 820 L 265 820 C 265 820, 268 800, 278 730 C 292 560, 292 370, 265 248 Z"
                  fill="none" stroke="#8B9A8E" strokeWidth="0.8" opacity="0.4"/>
            <line x1="265" y1="260" x2="420" y2="260" stroke="#4A7A8A" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5"/>
            <text x="342" y="256" fill="#4A7A8A" fontSize="6.5" textAnchor="middle" opacity="0.7">channel drain</text>
            {/* Pergola */}
            <rect x="303" y="310" width="108" height="108" rx="2" fill="none" stroke="#C8922A" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.8"/>
            <circle cx="308" cy="315" r="5" fill="#C8922A" opacity="0.85"/>
            <circle cx="406" cy="315" r="5" fill="#C8922A" opacity="0.85"/>
            <circle cx="308" cy="413" r="5" fill="#C8922A" opacity="0.85"/>
            <circle cx="406" cy="413" r="5" fill="#C8922A" opacity="0.85"/>
            <text x="357" y="308" fill="#C8922A" fontSize="8" textAnchor="middle" opacity="0.8">Pergola</text>
            {/* Raised planters */}
            <rect x="390" y="260" width="22" height="70" rx="1" fill="#3d2810" stroke="#C8922A" strokeWidth="0.8" opacity="0.7"/>
            <rect x="390" y="340" width="22" height="70" rx="1" fill="#3d2810" stroke="#C8922A" strokeWidth="0.8" opacity="0.7"/>
            {/* Zone 1 label */}
            <text x="340" y="530" fill="#8B9A8E" fontSize="10" fontWeight="500" letterSpacing="0.08em" textAnchor="middle" opacity="0.7">ZONE 1</text>
            <text x="340" y="546" fill="#8B9A8E" fontSize="8" textAnchor="middle" opacity="0.5">Patio + Pergola</text>
          </g>

          {/* Existing deck (house end) */}
          <rect x="30" y="900" width="390" height="70" rx="1" fill="#1e201c" stroke="#8B9A8E" strokeWidth="0.8" opacity="0.8"/>
          <rect x="30" y="900" width="390" height="70" fill="url(#hatch-deck)" opacity="0.6"/>
          <text x="225" y="940" fill="#8B9A8E" fontSize="9" textAnchor="middle" opacity="0.6">Existing Deck (datum 0.00m)</text>

          {/* North arrow */}
          <g transform="translate(415, 65)">
            <line x1="0" y1="15" x2="0" y2="-5" stroke="#8B9A8E" strokeWidth="1" opacity="0.6"/>
            <polygon points="0,-12 -4,-2 4,-2" fill="#8B9A8E" opacity="0.6"/>
            <text x="0" y="24" fill="#8B9A8E" fontSize="8" textAnchor="middle" opacity="0.5">N</text>
          </g>
        </svg>
      </div>
    </div>
  )
}
