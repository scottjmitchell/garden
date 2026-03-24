import { InputHTMLAttributes, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-garden-text/60">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`
          rounded border bg-white/5 px-3 py-2 text-sm text-garden-text
          placeholder:text-garden-text/30
          focus:outline-none focus:ring-1
          ${error
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-white/10 focus:ring-amber/40'
          }
          ${className}
        `.trim()}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
