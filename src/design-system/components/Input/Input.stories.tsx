import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story      = { args: { placeholder: 'Placeholder' } }
export const WithLabel: Story    = { args: { label: 'Field label', placeholder: 'Placeholder' } }
export const WithError: Story    = { args: { label: 'Field label', error: 'Something went wrong' } }
export const Disabled: Story     = { args: { label: 'Disabled', placeholder: 'Cannot edit', disabled: true } }
