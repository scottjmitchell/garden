// src/lib/firebase/hooks.ts
import { useState, useEffect, useRef } from 'react'
import { ref, onValue, update, set, remove, push } from 'firebase/database'
import { db } from './config'
import type {
  Phase, PhaseStatus,
  Task, TaskStatus, TaskOption,
  Material, MaterialStatus, MaterialOption, OptionStatus,
  BudgetItem,
} from '../../types'

const DB_ROOT = import.meta.env.VITE_DB_ROOT ?? 'garden'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPhases(raw: Record<string, any>): Phase[] {
  return (Object.entries(raw) as [string, any][])
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([id, p]) => ({
      id,
      num:    p.num,
      title:  p.title,
      date:   p.date,
      status: p.status as PhaseStatus,
      notes:  p.notes,
      tasks:  Object.entries(p.tasks ?? {})
        .sort(([, a], [, b]) => ((a as any).order ?? 0) - ((b as any).order ?? 0))
        .map(([tid, t]: [string, any]) => ({
          id:      tid,
          text:    t.text,
          done:    t.done ?? false,
          status:  t.status ?? undefined,
          notes:   t.notes,
          options: t.options
            ? Object.entries(t.options).reduce((acc, [oid, o]: [string, any]) => {
                acc[oid] = {
                  id:       oid,
                  name:     o.name,
                  price:    o.price,
                  url:      o.url,
                  notes:    o.notes,
                  selected: o.selected ?? false,
                }
                return acc
              }, {} as Record<string, TaskOption>)
            : undefined,
        } as Task)),
    }))
}

function toMaterials(raw: Record<string, any>): Material[] {
  return (Object.entries(raw) as [string, any][])
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([id, m]) => ({
      id,
      name:    m.name,
      spec:    m.spec,
      low:     m.low ?? 0,
      high:    m.high ?? 0,
      status:  m.status ?? 'researching',
      accent:  m.accent ?? '#C8922A',
      options: Object.entries(m.options ?? {}).map(([oid, o]: [string, any]) => ({
        id:        oid,
        name:      o.name,
        supplier:  o.supplier,
        leadTime:  o.leadTime,
        price:     o.price,
        url:       o.url,
        notes:     o.notes,
        imageUrl:  o.imageUrl,
        status:    o.status ?? null,
      })),
    }))
}

// ─── Phase notes localStorage fallback ───────────────────────────────────────
// Firebase rules may deny writes for pre-seeded phases. localStorage ensures
// notes persist within the same origin across reloads without touching the
// onValue pipeline (to avoid re-render interference with other tests).

export const PHASE_NOTES_STORAGE_KEY = `${DB_ROOT}/phase-notes`

export function loadStoredPhaseNote(phaseId: string): string {
  try {
    const stored = JSON.parse(localStorage.getItem(PHASE_NOTES_STORAGE_KEY) ?? '{}')
    return stored[phaseId] ?? ''
  } catch {
    return ''
  }
}

function saveStoredPhaseNote(phaseId: string, notes: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(PHASE_NOTES_STORAGE_KEY) ?? '{}')
    if (notes) { stored[phaseId] = notes } else { delete stored[phaseId] }
    localStorage.setItem(PHASE_NOTES_STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }
}

// ─── usePhases ────────────────────────────────────────────────────────────────

export function usePhases() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  // Optimistic done overrides: prevents Firebase rollbacks (permission_denied on seeded data)
  // from reverting UI immediately after toggle
  const optimisticDone = useRef<Map<string, boolean>>(new Map())

  useEffect(() => {
    return onValue(ref(db, `${DB_ROOT}/phases`), snap => {
      const rawPhases = snap.val() ? toPhases(snap.val()) : []
      const overrides = optimisticDone.current
      setPhases(
        overrides.size === 0
          ? rawPhases
          : rawPhases.map(p => ({
              ...p,
              tasks: p.tasks.map(t => {
                const key = `${p.id}/${t.id}`
                return overrides.has(key) ? { ...t, done: overrides.get(key)! } : t
              }),
            }))
      )
      setLoading(false)
    })
  }, [])

  function toggleTask(phaseId: string, taskId: string, done: boolean) {
    const key = `${phaseId}/${taskId}`
    optimisticDone.current.set(key, done)
    setPhases(prev => prev.map(p => p.id !== phaseId ? p : {
      ...p,
      tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, done }),
    }))
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { done })
      .then(() => optimisticDone.current.delete(key))
      .catch(() => setTimeout(() => optimisticDone.current.delete(key), 3000))
  }

  function updatePhaseNotes(phaseId: string, notes: string) {
    saveStoredPhaseNote(phaseId, notes)
    update(ref(db, `${DB_ROOT}/phases/${phaseId}`), { notes })
  }

  function addPhase(data: { num: string; title: string; date: string; status: PhaseStatus }) {
    const newRef = push(ref(db, `${DB_ROOT}/phases`))
    set(newRef, { ...data, tasks: {}, order: Date.now() })
  }

  function updatePhase(phaseId: string, data: { num: string; title: string; date: string; status: PhaseStatus }) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}`), data)
  }

  function deletePhase(phaseId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}`))
  }

  function addTask(phaseId: string, text: string) {
    const newRef = push(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks`))
    set(newRef, { text, done: false, order: Date.now() })
  }

  function updateTaskText(phaseId: string, taskId: string, text: string) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { text })
  }

  function updateTaskStatus(phaseId: string, taskId: string, status: TaskStatus | null) {
    update(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`), { status: status ?? null })
  }

  function updateTaskNotes(phaseId: string, taskId: string, notes: string) {
    set(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/notes`), notes)
  }

  function deleteTask(phaseId: string, taskId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}`))
  }

  function addTaskOption(phaseId: string, taskId: string, option: Omit<TaskOption, 'id'>) {
    const newRef = push(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options`))
    set(newRef, option)
  }

  function selectTaskOption(phaseId: string, taskId: string, selectedId: string, allOptionIds: string[]) {
    // Multi-path update: ref(db) points to root '/'.
    // Pass selectedId='' to deselect all.
    const updates: Record<string, boolean> = {}
    for (const id of allOptionIds) {
      updates[`${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options/${id}/selected`] = id === selectedId && selectedId !== ''
    }
    update(ref(db), updates)
  }

  function deleteTaskOption(phaseId: string, taskId: string, optionId: string) {
    remove(ref(db, `${DB_ROOT}/phases/${phaseId}/tasks/${taskId}/options/${optionId}`))
  }

  return {
    phases, loading,
    toggleTask, updatePhaseNotes,
    addPhase, updatePhase, deletePhase,
    addTask, updateTaskText, updateTaskStatus, updateTaskNotes, deleteTask,
    addTaskOption, selectTaskOption, deleteTaskOption,
  }
}

// ─── useMaterials ─────────────────────────────────────────────────────────────

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    return onValue(ref(db, `${DB_ROOT}/materials`), snap => {
      setMaterials(snap.val() ? toMaterials(snap.val()) : [])
      setLoading(false)
    })
  }, [])

  function setMaterialStatus(id: string, status: MaterialStatus) {
    set(ref(db, `${DB_ROOT}/materials/${id}/status`), status)
  }

  function addMaterial(data: Omit<Material, 'id' | 'options'>) {
    const newRef = push(ref(db, `${DB_ROOT}/materials`))
    set(newRef, { ...data, options: {}, order: -Date.now() })
  }

  function updateMaterial(id: string, data: Omit<Material, 'id' | 'options'>) {
    update(ref(db, `${DB_ROOT}/materials/${id}`), data)
  }

  function deleteMaterial(id: string) {
    remove(ref(db, `${DB_ROOT}/materials/${id}`))
  }

  function addOption(materialId: string, option: Omit<MaterialOption, 'id'>) {
    const newRef = push(ref(db, `${DB_ROOT}/materials/${materialId}/options`))
    set(newRef, option)
  }

  function updateOption(materialId: string, optionId: string, option: Omit<MaterialOption, 'id'>) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}`), option)
  }

  function deleteOption(materialId: string, optionId: string) {
    remove(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}`))
  }

  function setOptionStatus(materialId: string, optionId: string, status: OptionStatus) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}/status`), status)
  }

  function setOptionImage(materialId: string, optionId: string, imageUrl: string) {
    set(ref(db, `${DB_ROOT}/materials/${materialId}/options/${optionId}/imageUrl`), imageUrl)
  }

  return {
    materials, loading,
    setMaterialStatus, addMaterial, updateMaterial, deleteMaterial,
    addOption, updateOption, deleteOption, setOptionStatus, setOptionImage,
  }
}

// ─── useBudget ────────────────────────────────────────────────────────────────

function toBudgetItems(raw: Record<string, any>): BudgetItem[] {
  return (Object.entries(raw) as [string, any][])
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([id, item]) => ({
      id,
      name:   item.name,
      low:    item.low ?? 0,
      high:   item.high ?? 0,
      actual: item.actual,
      order:  item.order,
    }))
}

export function useBudget() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onValue(ref(db, `${DB_ROOT}/budgetItems`), snap => {
      setItems(snap.val() ? toBudgetItems(snap.val()) : [])
      setLoading(false)
    })
  }, [])

  function setActual(id: string, actual: number | undefined) {
    set(ref(db, `${DB_ROOT}/budgetItems/${id}/actual`), actual ?? null)
  }

  function addBudgetItem(data: { name: string; low: number; high: number }) {
    const newRef = push(ref(db, `${DB_ROOT}/budgetItems`))
    set(newRef, { ...data, order: Date.now() })
  }

  function updateBudgetItem(id: string, data: { name: string; low: number; high: number }) {
    update(ref(db, `${DB_ROOT}/budgetItems/${id}`), data)
  }

  function deleteBudgetItem(id: string) {
    remove(ref(db, `${DB_ROOT}/budgetItems/${id}`))
  }

  return { items, loading, setActual, addBudgetItem, updateBudgetItem, deleteBudgetItem }
}
