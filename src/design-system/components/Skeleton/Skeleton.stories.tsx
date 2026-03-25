import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'
import { Card } from '../Card/Card'

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: { className: 'h-4 w-48' },
}

export const CardSkeleton: Story = {
  render: () => (
    <Card className="space-y-3 max-w-xs">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </Card>
  ),
}

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-2 max-w-xs">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  ),
}
