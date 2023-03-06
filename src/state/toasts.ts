import create from "zustand"
import { ReactElement, ReactNode } from "react"
import { v4 as uuid } from "uuid"
import { renderToString } from "react-dom/server"
import { useEffectOnce, useLocalStorage } from "react-use"
import { useAccountStore } from "./store"

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const
export type ToastVariant = "info" | "success" | "error" | "progress"
export type ToastMessageType = typeof TOAST_MESSAGES[number]

type ToastParams = {
  id?: string
  link?: string
  title: ReactElement
  actions?: ReactNode
  persist?: boolean
}

type ToastData = ToastParams & {
  id: string
  variant: ToastVariant
  hidden: boolean
  dateCreated: string
  title: string
}

interface ToastStore {
  toasts: ToastData[]
  add: (
    variant: ToastVariant,
    toast: ToastParams,
    setLocalStorage: (toasts: ToastData[]) => void,
  ) => string
  remove: (id: string) => void
  hide: (id: string) => void
  syncActivities: (toasts: ToastData[]) => void

  sidebar: boolean
  setSidebar: (value: boolean) => void
}

const useToastsStore = create<ToastStore>((set) => ({
  toasts: [],
  sidebar: false,

  add(variant, toast, setLocalStorage) {
    const id = toast.id ?? uuid()
    const dateCreated = new Date().toISOString()
    const title = renderToString(toast.title)

    set((state) => {
      // set max 10 toasts
      const prevToasts =
        state.toasts.length > 9
          ? state.toasts
              .sort(
                (a, b) =>
                  new Date(b.dateCreated).getTime() -
                  new Date(a.dateCreated).getTime(),
              )
              .slice(0, 9)
          : [...state.toasts]

      const toasts = [
        {
          ...toast,
          variant,
          title,
          dateCreated,
          id,
          hidden: state.sidebar,
        } as ToastData,
        ...prevToasts,
      ]
      setLocalStorage(toasts)
      return { toasts }
    })

    return id
  },
  remove(id: string) {
    set((state) => {
      const toasts = state.toasts.filter((t) => t.id !== id)
      return { toasts }
    })
  },
  hide(id: string) {
    set((state) => ({
      toasts: state.toasts.map((toast) => {
        if (toast.id === id) return { ...toast, hidden: true }
        return toast
      }),
    }))
  },
  setSidebar: (sidebar) =>
    set((state) => ({
      sidebar,
      toasts: sidebar
        ? state.toasts.map((toast) => ({ ...toast, hidden: sidebar }))
        : state.toasts,
    })),
  syncActivities: (activities) =>
    set({
      toasts: activities.map((activity) => ({ ...activity, hidden: true })),
    }),
}))

export const useToast = () => {
  const store = useToastsStore()
  const { account } = useAccountStore()
  const [activities, setActivities] = useLocalStorage<ToastData[]>(
    `toasts_${account?.address}`,
    [],
  )
  useEffectOnce(() => {
    store.syncActivities(activities ?? [])
  })

  const add = (variant: ToastVariant, toast: ToastParams) =>
    store.add(variant, toast, setActivities)

  const info = (toast: ToastParams) => add("info", toast)
  const success = (toast: ToastParams) => add("success", toast)
  const error = (toast: ToastParams) => add("error", toast)
  const loading = (toast: ToastParams) => add("progress", toast)

  return { ...store, add, info, success, error, loading }
}
