interface Tab {
  id:    string
  label: string
}

interface TabsProps {
  tabs:     Tab[]
  active:   string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-white/10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 text-sm transition-colors
            ${tab.id === active
              ? 'border-b-2 border-amber text-amber'
              : 'text-garden-text/50 hover:text-garden-text'
            }
          `.trim()}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
