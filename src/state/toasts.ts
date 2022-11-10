import create from "zustand"
import { ReactNode } from "react"
import { v4 as uuid } from "uuid"

export interface ToastData extends ToastParams {
  id: string
  variant?: "info" | "success" | "error" | "loading"
}

interface ToastParams {
  id?: string
  text?: string
  children?: ReactNode
  persist?: boolean
  onClose?: () => void
}

interface ToastStore {
  toasts: ToastData[]
  add: (toast: ToastData) => void
  remove: (id: string) => void
}

const useToastsStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  remove: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const useToast = () => {
  const { toasts, add, remove } = useToastsStore()

  const info = (toast: ToastParams) => {
    const id = toast.id ?? uuid()
    add({ id, ...toast, variant: "info" })
    return id
  }
  const success = (toast: ToastParams) => {
    const id = toast.id ?? uuid()
    add({ id, ...toast, variant: "success" })
    return id
  }
  const error = (toast: ToastParams) => {
    const id = toast.id ?? uuid()
    add({ id, ...toast, variant: "error" })
    return id
  }
  const loading = (toast: ToastParams) => {
    const id = toast.id ?? uuid()
    add({ id, ...toast, variant: "loading" })
    return id
  }

  return { toasts, info, success, error, loading, remove }
}
