import create from "zustand"
import { ReactNode } from "react"
import { v4 as uuid } from "uuid"

type ToastVariant = "info" | "success" | "error" | "loading"

export interface ToastData extends ToastParams {
  id: string
  variant?: ToastVariant
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

  sidebar: boolean
  setSidebar: (value: boolean) => void
}

const useToastsStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  remove: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  sidebar: false,
  setSidebar: (sidebar: boolean) => set({ sidebar }),
}))

export const useToast = () => {
  const store = useToastsStore()

  const add = (variant: ToastVariant, toast: ToastParams) => {
    const id = toast.id ?? uuid()
    store.add({ id, ...toast, variant })
    return id
  }

  const info = (toast: ToastParams) => add("info", toast)
  const success = (toast: ToastParams) => add("success", toast)
  const error = (toast: ToastParams) => add("error", toast)
  const loading = (toast: ToastParams) => add("loading", toast)

  return { ...store, info, success, error, loading }
}
