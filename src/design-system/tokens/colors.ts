// Design token values — single source of truth.
// Tailwind classes reference these same values via tailwind.config.ts.
// Use these constants when you need the raw value (e.g. SVG fill, canvas, inline styles).

export const colors = {
  amber:     '#C8922A',
  moss:      '#3D5239',
  bg:        '#111410',
  bgRaised:  '#171a13',
  bgCard:    '#1c2017',
  text:      '#EDE8DC',
  textMuted: '#8A9485',
  border:    'rgba(168, 155, 120, 0.13)',
} as const
