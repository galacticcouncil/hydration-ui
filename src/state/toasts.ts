import { create } from "zustand"
import { ReactElement, ReactNode, useMemo } from "react"
import { v4 as uuid } from "uuid"
import { renderToString } from "react-dom/server"
import { useAccountStore } from "./store"
import { createJSONStorage, persist } from "zustand/middleware"
import { Maybe } from "utils/helpers"

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const
export type ToastVariant = "info" | "success" | "error" | "progress" | "unknown"
export type ToastMessageType = (typeof TOAST_MESSAGES)[number]

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
  toasts: Record<string, Array<ToastData>>
  update: (
    accoutAddress: Maybe<string>,
    callback: (toasts: Array<ToastData>) => Array<ToastData>,
  ) => void

  sidebar: boolean
  setSidebar: (value: boolean) => void
}

const useToastsStore = create<ToastStore>()(
  persist(
    (set) => ({
      toasts: {},
      sidebar: false,
      update(accoutAddress, callback) {
        set((state) => {
          const accountToasts = accoutAddress
            ? state.toasts[accoutAddress] ?? []
            : []
          const toasts = callback(accountToasts)

          return {
            toasts: {
              ...state.toasts,
              ...(!!accoutAddress && { [accoutAddress]: toasts }),
            },
          }
        })
      },
      setSidebar: (sidebar) =>
        set({
          sidebar,
        }),
    }),
    {
      name: "toasts",
      storage: createJSONStorage(() => ({
        async getItem(name: string) {
          const storeToasts = window.localStorage.getItem(name)
          const storeAccount = window.localStorage.getItem("account")

          if (storeAccount == null) return storeToasts

          const { state: account } = JSON.parse(storeAccount)

          const accountAddress = account?.account.address

          if (accountAddress) {
            const accountToastsDeprecated = window.localStorage.getItem(
              `toasts_${accountAddress}`,
            )

            const toastsDeprecated =
              accountToastsDeprecated &&
              JSON.parse(accountToastsDeprecated).map((toast: ToastData) => ({
                ...toast,
                hidden: true,
              }))

            if (storeToasts != null) {
              const { state: toastsState } = JSON.parse(storeToasts)

              const allToasts = { ...toastsState.toasts }

              const accountToasts = allToasts[accountAddress]

              if (!accountToasts) {
                if (toastsDeprecated != null) {
                  allToasts[accountAddress] = toastsDeprecated

                  window.localStorage.removeItem(`toasts_${accountAddress}`) // remove deprecated storage
                } else {
                  allToasts[accountAddress] = []
                }
              }
              return JSON.stringify({
                ...toastsState,
                state: { toasts: allToasts },
              })
            } else {
              if (toastsDeprecated != null) {
                window.localStorage.removeItem(`toasts_${accountAddress}`) // remove deprecated storage
                return JSON.stringify({
                  version: 0,
                  state: {
                    toasts: {
                      [accountAddress]: toastsDeprecated,
                    },
                  },
                })
              } else {
                return JSON.stringify({
                  version: 0,
                  state: {
                    toasts: {
                      [accountAddress]: [],
                    },
                  },
                })
              }
            }
          }
          return storeToasts
        },
        setItem(name, value) {
          const parsedState = JSON.parse(value)

          const stringState = JSON.stringify({
            version: parsedState.version,
            state: { toasts: parsedState.state.toasts },
          })

          window.localStorage.setItem(name, stringState)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      })),
    },
  ),
)

export const useToast = () => {
  const store = useToastsStore()
  const { account } = useAccountStore()

  const toasts = useMemo(() => {
    if (account?.address) {
      const toasts = store.toasts[account?.address]

      if (!toasts) {
        // check if there is deprecated toast storage
        const accountToastsDeprecated = window.localStorage.getItem(
          `toasts_${account.address}`,
        )

        if (accountToastsDeprecated) {
          const toastsDeprecated: Array<ToastData> = JSON.parse(
            accountToastsDeprecated,
          ).map((toast: ToastData) => ({ ...toast, hidden: true }))

          store.update(account.address, () => toastsDeprecated)

          window.localStorage.removeItem(`toasts_${account.address}`) // remove deprecated storage

          return toastsDeprecated
        } else {
          return []
        }
      }

      return toasts
    }
    return []
  }, [account?.address, store])

  const add = (variant: ToastVariant, toast: ToastParams) => {
    const id = toast.id ?? uuid()
    const dateCreated = new Date().toISOString()
    const title = renderToString(toast.title)

    store.update(account?.address, (toasts) => {
      // set max 10 toasts
      const prevToasts =
        toasts.length > 9
          ? toasts
              .sort(
                (a, b) =>
                  new Date(b.dateCreated).getTime() -
                  new Date(a.dateCreated).getTime(),
              )
              .slice(0, 9)
          : [...toasts]

      return [
        {
          ...toast,
          variant,
          title,
          dateCreated,
          id,
          hidden: store.sidebar,
        } as ToastData,
        ...prevToasts,
      ]
    })

    return id
  }

  const info = (toast: ToastParams) => add("info", toast)
  const success = (toast: ToastParams) => add("success", toast)
  const error = (toast: ToastParams) => add("error", toast)
  const loading = (toast: ToastParams) => add("progress", toast)
  const unknown = (toast: ToastParams) => add("unknown", toast)

  const hide = (id: string) =>
    store.update(account?.address, (toasts) =>
      toasts.map((toast) =>
        toast.id === id ? { ...toast, hidden: true } : toast,
      ),
    )

  const remove = (id: string) => {
    store.update(account?.address, (toasts) =>
      toasts.filter((t) => t.id !== id),
    )
  }

  const setSidebar = (isOpen: boolean) => {
    if (isOpen)
      store.update(account?.address, (toasts) =>
        toasts.map((toast) => ({ ...toast, hidden: true })),
      )

    store.setSidebar(isOpen)
  }

  return {
    sidebar: store.sidebar,
    toasts,
    setSidebar,
    add,
    hide,
    remove,
    info,
    success,
    error,
    loading,
    unknown,
  }
}
