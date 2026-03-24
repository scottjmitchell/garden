interface PageHeaderProps {
  title:     string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl text-amber">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-garden-text/60">{subtitle}</p>
      )}
    </div>
  )
}
