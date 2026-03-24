import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded border border-white/10 bg-[#1c2017] p-4 ${className}`}
    >
      {children}
    </div>
  )
}
