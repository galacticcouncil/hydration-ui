import create from "zustand"
import { ReactNode } from "react"
import { v4 as uuid } from "uuid"

export interface ToastData extends ToastParams {
  id: string
}

interface ToastParams {
  variant?: "info" | "success" | "error" | "loading"
  text?: string
  children?: ReactNode
}

interface ToastStore {
  toasts: ToastData[]
  add: (toast: ToastData) => void
  remove: (id: string) => void
}

export const useToastsStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  remove: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const useToast = () => {
  const { toasts, add, remove } = useToastsStore()

  const info = (toast: ToastParams) =>
    add({ ...toast, id: uuid(), variant: "info" })
  const success = (toast: ToastParams) =>
    add({ ...toast, id: uuid(), variant: "success" })
  const error = (toast: ToastParams) =>
    add({ ...toast, id: uuid(), variant: "error" })
  const loading = (toast: ToastParams) =>
    add({ ...toast, id: uuid(), variant: "loading" })

  return { toasts, info, success, error, loading, add, remove }
}
