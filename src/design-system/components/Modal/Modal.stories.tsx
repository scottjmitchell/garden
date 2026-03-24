import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '../Button/Button'

const meta: Meta<typeof Modal> = {
  component: Modal,
  tags: ['autodocs'],
}
export default meta

export const Default: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
          <p className="text-sm text-garden-text/70">Modal content goes here.</p>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </>
    )
  },
}
