import { create, StateCreator } from "zustand"
import React, { ReactElement, ReactNode } from "react"
import { v4 as uuid } from "uuid"
import { renderToString } from "react-dom/server"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Trans } from "react-i18next"
import { ToastMessage } from "./store"
import { useShallow } from "hooks/useShallow"
import { usePrevious } from "react-use"
import { tags } from "@galacticcouncil/xcm-cfg"

export type MetaTags = Array<keyof typeof tags.Tag>

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const
export type ToastVariant =
  | "info"
  | "success"
  | "error"
  | "progress"
  | "unknown"
  | "temporary"
export type ToastMessageType = (typeof TOAST_MESSAGES)[number]

type ToastParams = {
  id?: string
  link?: string
  title: ReactElement
  actions?: ReactNode
  persist?: boolean
  bridge?: MetaTags
  isHydraSource?: boolean
  txHash?: string
  hideTime?: number
  hidden?: boolean
  xcm?: "evm" | "substrate" | "solana"
}

export type ToastData = ToastParams & {
  id: string
  variant: ToastVariant
  hidden: boolean
  dateCreated: string
  title: string
}

interface ToastStore {
  toasts: Record<string, Array<ToastData>>
  update: (
    accoutAddress: string,
    callback: (toasts: Array<ToastData>) => Array<ToastData>,
  ) => void
  sidebar: boolean
  setSidebar: (value: boolean) => void
}

interface TemporaryToasts {
  toastsTemp: Array<ToastData>
  updateToastsTemp: (toast: ToastData) => void
  hideToastsTemp: (id: string) => void
}

export const temporaryToastsSlice: StateCreator<
  TemporaryToasts & ToastStore,
  [],
  [],
  TemporaryToasts
> = (set) => ({
  toastsTemp: [],
  updateToastsTemp: (toast: ToastData) =>
    set((state) => ({ toastsTemp: [...state.toastsTemp, toast] })),
  hideToastsTemp: (id: string) =>
    set((state) => ({
      toastsTemp: state.toastsTemp.filter((toast) => toast.id !== id),
    })),
})

const useToastsStore = create<ToastStore & TemporaryToasts>()(
  persist(
    (...actions) => {
      const [set] = actions

      return {
        toasts: {},
        sidebar: false,
        update(accoutAddress, callback) {
          set((state) => {
            const accountToasts = state.toasts[accoutAddress] ?? []
            const toasts = callback(accountToasts)

            return {
              toasts: {
                ...state.toasts,
                ...{ [accoutAddress]: toasts },
              },
            }
          })
        },
        setSidebar: (sidebar) =>
          set({
            sidebar,
          }),
        ...temporaryToastsSlice(...actions),
      }
    },
    {
      name: "toasts",
      storage: createJSONStorage(() => ({
        async getItem(name: string) {
          return window.localStorage.getItem(name)
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
  const currentAddress = useAccount().account?.address
  const prevAddress = usePrevious(currentAddress)
  const store = useToastsStore(
    useShallow((state) => {
      const isAccountSwitched = currentAddress !== prevAddress
      const toasts = currentAddress ? state.toasts[currentAddress] ?? [] : []

      return {
        ...state,
        toasts: isAccountSwitched
          ? toasts.map((toast) => ({ ...toast, hidden: true }))
          : toasts,
      }
    }),
  )

  const add = (variant: ToastVariant, toast: ToastParams, address?: string) => {
    const id = toast.id ?? uuid()
    const dateCreated = new Date().toISOString()
    const title =
      typeof toast.title === "string"
        ? toast.title
        : renderToString(toast.title)

    const accountAddress = address ?? currentAddress

    if (!accountAddress) return

    const newToast = {
      ...toast,
      variant,
      title,
      dateCreated,
      id,
      hidden: !!toast.hidden || store.sidebar,
    } as ToastData

    if (variant !== "temporary") {
      store.update(accountAddress, (accountToasts) => {
        //remove toasts with same id and set max 10
        const prevToasts = accountToasts
          .filter((toast) => toast.id !== id)
          .slice(0, 9)

        return [newToast, ...prevToasts]
      })
    } else {
      store.updateToastsTemp(newToast)
    }

    return id
  }

  const editToast = (id: string, props: Partial<ToastData>) => {
    if (!currentAddress) return

    store.update(currentAddress, (toasts) =>
      toasts.map((toast) => (toast.id === id ? { ...toast, ...props } : toast)),
    )
  }

  const info = (toast: ToastParams, address?: string) =>
    add("info", toast, address)
  const success = (toast: ToastParams, address?: string) =>
    add("success", toast, address)
  const error = (toast: ToastParams, address?: string) =>
    add("error", toast, address)
  const loading = (toast: ToastParams, address?: string) =>
    add("progress", toast, address)
  const unknown = (toast: ToastParams, address?: string) =>
    add("unknown", toast, address)
  const temporary = (toast: ToastParams, address?: string) =>
    add("temporary", toast, address)

  const hide = (id: string) => {
    if (!currentAddress) return

    store.update(currentAddress, (toasts) =>
      toasts.map((toast) =>
        toast.id === id ? { ...toast, hidden: true } : toast,
      ),
    )

    store.hideToastsTemp(id)
  }

  const setSidebar = (isOpen: boolean) => {
    if (isOpen && currentAddress) {
      store.update(currentAddress, (toasts) =>
        toasts.map((toast) => ({ ...toast, hidden: true })),
      )
    }

    store.setSidebar(isOpen)
  }

  const removeToast = (id: string) => {
    if (!currentAddress) return

    store.update(currentAddress, (toasts) => toasts.filter((t) => t.id !== id))
  }

  return {
    sidebar: store.sidebar,
    toasts: store.toasts,
    toastsTemp: store.toastsTemp,
    setSidebar,
    add,
    hide,
    removeToast,
    info,
    success,
    error,
    loading,
    unknown,
    temporary,
    editToast,
  }
}

type TransProps = Omit<
  React.ComponentPropsWithRef<typeof Trans>,
  "components"
> & {
  components?: string[]
}

export const createToastMessages = (
  i18nKeyPrefix: string,
  options: TransProps,
) => {
  const { t, tOptions, components = [], ...rest } = options || {}

  return TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        tOptions={tOptions}
        {...rest}
        i18nKey={`${i18nKeyPrefix}.${msType}` as TransProps["i18nKey"]}
        components={components.map((tag) => {
          const [element, className] = tag.split(".")
          return React.createElement(element, { className })
        })}
      ></Trans>
    )
    return memo
  }, {} as ToastMessage)
}
