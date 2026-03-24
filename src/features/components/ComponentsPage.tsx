import { useState } from 'react'
import {
  Button, Card, Badge, Modal, Input, Tabs, PageHeader, EmptyState,
} from '../../design-system'

const TABS = [
  { id: 'first',  label: 'First'  },
  { id: 'second', label: 'Second' },
  { id: 'third',  label: 'Third'  },
]

export function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('first')

  return (
    <div className="space-y-12">
      <PageHeader title="Component Gallery" subtitle="Design system reference" />

      {/* Button */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button data-testid="btn-primary">Primary</Button>
          <Button data-testid="btn-secondary" variant="secondary">Secondary</Button>
          <Button data-testid="btn-ghost" variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Card */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Card</h2>
        <Card data-testid="card-example" className="max-w-xs">
          <p className="text-sm">A generic card with any content inside.</p>
        </Card>
      </section>

      {/* Badge */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge data-testid="badge-default">Default</Badge>
          <Badge data-testid="badge-success" variant="success">Success</Badge>
          <Badge data-testid="badge-warning" variant="warning">Warning</Badge>
          <Badge data-testid="badge-danger"  variant="danger">Danger</Badge>
        </div>
      </section>

      {/* PageHeader */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">PageHeader</h2>
        <div data-testid="page-header-example">
          <PageHeader title="Example Title" subtitle="With an optional subtitle" />
        </div>
      </section>

      {/* EmptyState */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">EmptyState</h2>
        <div data-testid="empty-state-example">
          <EmptyState
            title="Nothing here yet"
            description="Add something to see it appear."
            action={<Button size="sm">Add item</Button>}
          />
        </div>
      </section>

      {/* Input */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Input</h2>
        <div data-testid="input-example" className="max-w-xs space-y-3">
          <Input label="Label" placeholder="Placeholder text" />
          <Input label="With error" error="Something went wrong" />
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Tabs</h2>
        <div data-testid="tabs-example">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="mt-4 text-sm text-garden-text/60">
            {activeTab === 'first'  && <p>Content for First</p>}
            {activeTab === 'second' && <p>Content for Second</p>}
            {activeTab === 'third'  && <p>Content for Third</p>}
          </div>
        </div>
      </section>

      {/* Modal */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-garden-text/40">Modal</h2>
        <Button data-testid="modal-trigger" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
          <p className="text-sm text-garden-text/70">Modal content goes here.</p>
        </Modal>
      </section>
    </div>
  )
}
