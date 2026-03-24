import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size    = 'sm' | 'md'

const variantClasses: Record<Variant, string> = {
  primary:   'bg-amber text-garden-bg hover:brightness-110',
  secondary: 'border border-amber/50 text-amber hover:border-amber',
  ghost:     'text-garden-text/60 hover:text-garden-text',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
}

export function Button({
  variant = 'primary',
  size    = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center rounded transition-all
        font-sans font-medium disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
    >
      {children}
    </button>
  )
}
