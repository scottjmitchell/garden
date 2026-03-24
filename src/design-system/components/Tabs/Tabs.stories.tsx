import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tabs } from './Tabs'

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ['autodocs'],
}
export default meta

const TABS = [
  { id: 'one',   label: 'One'   },
  { id: 'two',   label: 'Two'   },
  { id: 'three', label: 'Three' },
]

// Tabs are controlled — need local state to show interaction in Storybook
export const Default: StoryObj = {
  render: () => {
    const [active, setActive] = useState('one')
    return <Tabs tabs={TABS} active={active} onChange={setActive} />
  },
}
