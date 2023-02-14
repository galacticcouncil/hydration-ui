import { ReactElement, ReactNode, createContext, useContext } from "react"
import { renderToString } from "react-dom/server"
import { createStore, useStore } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuid } from "uuid"
import { useAccountStore } from "state/store"

export type ToastVariant = "info" | "success" | "error" | "progress" | "unknown"

export const RESET_TOAST_TIMING = 60000 //ms

type ToastParams = {
  id?: string
  link?: string
  title: ReactElement
}

type ToastData = {
  id: string
  variant: ToastVariant
  hidden: boolean
  dateCreated: string
  title: string
  link?: string
}

interface ToastStore {
  toasts: ToastData[]
  add: (variant: ToastVariant, toast: ToastParams) => string
  remove: (id: string) => void
  hide: (id: string) => void
  success: (toast: ToastParams) => void
  info: (toast: ToastParams) => void
  loading: (toast: ToastParams) => string
  error: (toast: ToastParams) => void
  unknown: (id: string) => void

  sidebar: boolean
  setSidebar: (value: boolean) => void
}

const MyContext = createContext<ReturnType<typeof createMyStore> | null>(null)

const createMyStore = (address: string) => {
  return createStore<ToastStore>()(
    persist(
      (set) => {
        const addTest = (variant: ToastVariant, toast: ToastParams) => {
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
                variant,
                title,
                dateCreated,
                id,
                hidden: state.sidebar,
                link: toast.link,
              },
              ...prevToasts,
            ]

            return { toasts }
          })

          return id
        }

        return {
          toasts: [],
          sidebar: false,

          add: (variant, toast) => addTest(variant, toast),
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
          unknown(id: string) {
            set((state) => {
              return {
                toasts: state.toasts.map((toast) =>
                  toast.id === id ? { ...toast, variant: "unknown" } : toast,
                ),
              }
            })
          },
          success: (toast: ToastParams) => addTest("success", toast),
          info: (toast: ToastParams) => addTest("info", toast),
          loading: (toast: ToastParams) => addTest("progress", toast),
          error: (toast: ToastParams) => addTest("error", toast),
        }
      },
      {
        name: `toasts_${address}`,
        getStorage: () => ({
          getItem(name: string) {
            const value = window.localStorage.getItem(name)

            if (value == null) return JSON.stringify({ state: { toasts: [] } })

            const toasts = JSON.parse(value)

            return JSON.stringify({ state: { toasts } })
          },
          setItem(name, newValue) {
            const { state } = JSON.parse(newValue)
            window.localStorage.setItem(name, JSON.stringify(state.toasts))
          },
          removeItem(name) {
            window.localStorage.removeItem(name)
          },
        }),
      },
    ),
  )
}

export const ToastsStorage = ({ children }: { children: ReactNode }) => {
  const { account } = useAccountStore()
  const store = createMyStore(account?.address ?? "")

  return <MyContext.Provider value={store}>{children}</MyContext.Provider>
}

export const useToastStorage = () => {
  const store = useContext(MyContext)

  if (store === null) {
    throw new Error("no provider")
  }
  return useStore(store)
}
