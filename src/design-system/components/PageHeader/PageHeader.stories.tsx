import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof PageHeader>

export const TitleOnly: Story    = { args: { title: 'Page Title' } }
export const WithSubtitle: Story = { args: { title: 'Page Title', subtitle: 'Optional subtitle text' } }
