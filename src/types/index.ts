// ─── Plan ────────────────────────────────────────────────────────────────────

export type PhaseStatus = 'done' | 'current' | 'upcoming'

export interface Task {
  id:   string
  text: string
  done: boolean
}

export interface Phase {
  id:     string
  num:    string
  title:  string
  date:   string
  status: PhaseStatus
  tasks:  Task[]
  notes?: string
}

// ─── Materials ───────────────────────────────────────────────────────────────

export type MaterialStatus = 'researching' | 'to-order' | 'ordered' | 'delivered'

export interface MaterialOption {
  id:        string
  name:      string
  price:     string
  url?:      string
  imageUrl?: string
  notes?:    string
}

export interface Material {
  id:          string
  name:        string
  spec:        string
  cost:        string
  status:      MaterialStatus
  statusLabel: string
  options:     MaterialOption[]
  accent:      string
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface BudgetItem {
  id:      string
  name:    string
  low:     number
  high:    number
  actual?: number
}

// ─── Journal ─────────────────────────────────────────────────────────────────

export interface JournalSlot {
  id:        string
  label:     string
  phase:     string
  imageUrl?: string
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export interface Zone {
  id:    string
  title: string
  desc:  string
}
