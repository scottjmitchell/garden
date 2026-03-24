import { HTMLAttributes } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger'

const variantClasses: Record<Variant, string> = {
  default: 'bg-white/10 text-garden-text/70',
  success: 'bg-moss/40 text-green-300',
  warning: 'bg-amber/20 text-amber',
  danger:  'bg-red-900/40 text-red-300',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
