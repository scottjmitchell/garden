import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: { children: 'Card content goes here.' },
}

export const WithMultipleChildren: Story = {
  render: () => (
    <Card>
      <p className="font-display text-lg text-amber">Title</p>
      <p className="mt-1 text-sm text-garden-text/60">Supporting text below the title.</p>
    </Card>
  ),
}
