import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import { Button } from '../Button/Button'

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof EmptyState>

export const TitleOnly: Story = {
  args: { title: 'Nothing here yet' },
}

export const WithDescription: Story = {
  args: {
    title:       'Nothing here yet',
    description: 'Add something to see it appear here.',
  },
}

export const WithAction: Story = {
  args: {
    title:       'Nothing here yet',
    description: 'Add something to see it appear here.',
    action:      <Button size="sm">Add item</Button>,
  },
}
