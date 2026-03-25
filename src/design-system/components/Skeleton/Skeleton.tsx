interface SkeletonProps {
  className?: string
}

// A single pulsing placeholder block.
// Compose multiples to mirror the shape of the content that's loading.
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded bg-white/5 ${className}`} />
  )
}
