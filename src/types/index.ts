// src/types/index.ts

// ─── Plan ────────────────────────────────────────────────────────────────────

export type PhaseStatus = 'done' | 'current' | 'upcoming'

export type TaskStatus = 'not-started' | 'in-progress' | 'done'

export interface TaskOption {
  id:        string
  name:      string
  price?:    number
  url?:      string
  notes?:    string
  selected?: boolean
}

export interface Task {
  id:      string
  text:    string
  done:    boolean
  status?: TaskStatus
  notes?:  string
  options?: Record<string, TaskOption>
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

export type OptionStatus = 'shortlisted' | 'ordered' | 'rejected' | null

export interface MaterialOption {
  id:        string
  name:      string
  supplier?: string
  leadTime?: string
  price?:    number
  url?:      string
  notes?:    string
  imageUrl?: string
  status?:   OptionStatus
}

export interface Material {
  id:      string
  name:    string
  spec:    string
  low:     number
  high:    number
  status:  MaterialStatus
  accent:  string
  options: MaterialOption[]
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface BudgetItem {
  id:      string
  name:    string
  low:     number
  high:    number
  actual?: number
  order?:  number
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
