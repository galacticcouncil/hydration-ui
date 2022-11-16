import create from "zustand"
import { ReactNode } from "react"
import { v4 as uuid } from "uuid"

type ToastVariant = "info" | "success" | "error" | "loading"

export interface ToastData extends ToastParams {
  id: string
  variant?: ToastVariant
  hidden: boolean
  dateCreated: Date
}

interface ToastParams {
  id?: string
  text?: string
  children?: ReactNode
  persist?: boolean
}

interface ToastStore {
  toasts: ToastData[]
  add: (variant: ToastVariant, toast: ToastParams) => string
  remove: (id: string) => void
  hide: (id: string) => void

  sidebar: boolean
  setSidebar: (value: boolean) => void
}

const useToastsStore = create<ToastStore>((set) => ({
  toasts: [],
  sidebar: false,

  add(variant, toast) {
    const id = toast.id ?? uuid()
    const hidden = false
    const dateCreated = new Date()

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, hidden, variant, dateCreated }],
    }))
    return id
  },
  remove(id: string) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
  hide(id: string) {
    set((state) => ({
      toasts: state.toasts.map((toast) => {
        if (toast.id === id) return { ...toast, hidden: true }
        return toast
      }),
    }))
  },
  setSidebar: (sidebar: boolean) => set({ sidebar }),
}))

export const useToast = () => {
  const store = useToastsStore()

  const info = (toast: ToastParams) => store.add("info", toast)
  const success = (toast: ToastParams) => store.add("success", toast)
  const error = (toast: ToastParams) => store.add("error", toast)
  const loading = (toast: ToastParams) => store.add("loading", toast)

  return { ...store, info, success, error, loading }
}
