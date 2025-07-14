import {
  DEFAULT_AUTO_CLOSE_TIME,
  Notification,
  ToastVariant,
} from "@galacticcouncil/ui/components"
import { uuid } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xcm-core"
import { useCallback } from "react"
import { toast as toastSonner } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

import { TransactionMeta } from "@/states/transactions"

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const

export type ToastMeta = TransactionMeta & {
  txHash: string
  ecosystem: CallType
}

export type ToastMessageType = (typeof TOAST_MESSAGES)[number]

type ToastParams = {
  title: string
  id?: string
  link?: string
  persist?: boolean
  address?: string
  hint?: string
  meta: ToastMeta
}

export type ToastData = ToastParams & {
  id: string
  variant: ToastVariant
  dateCreated: string
}

interface ToastStore {
  toasts: Record<string, Array<ToastData>>
  update: (
    accoutAddress: string,
    callback: (toasts: Array<ToastData>) => Array<ToastData>,
  ) => void
}

const useToastsStore = create<ToastStore>()(
  persist(
    (set) => ({
      toasts: {},
      update: (accoutAddress, cb) =>
        set((state) => {
          const accountToasts = state.toasts[accoutAddress] ?? []

          return {
            toasts: {
              ...state.toasts,
              ...{ [accoutAddress]: cb(accountToasts) },
            },
          }
        }),
    }),
    {
      name: "toasts",
      version: 2,
    },
  ),
)

export const useToasts = () => {
  const { account } = useAccount()
  const { update } = useToastsStore()

  const currentAddress = account?.address

  const toasts = useToastsStore(
    useShallow((state) =>
      currentAddress ? (state.toasts[currentAddress] ?? []) : [],
    ),
  )

  const add = useCallback(
    (
      {
        address = currentAddress,
        id = uuid(),
        persist = true,
        ...toast
      }: ToastParams,
      variant: ToastVariant,
    ) => {
      const dateCreated = new Date().toISOString()
      const newToast = {
        ...toast,
        variant,
        dateCreated,
        id,
      }

      toastSonner.custom(
        () => <Notification variant={variant} content={toast.title} />,
        { id, duration: DEFAULT_AUTO_CLOSE_TIME },
      )

      if (persist && address) {
        update(address, (accountToasts) => {
          // remove toasts with same id, keep most recent 9 + 1 new
          const prevToasts = accountToasts
            .filter((toast) => toast.id !== id)
            .slice(0, 9)

          return [newToast, ...prevToasts]
        })
      }

      return id
    },
    [currentAddress, update],
  )

  const edit = useCallback(
    (id: string, props: Partial<ToastData>) => {
      if (!currentAddress) return

      update(currentAddress, (toasts) =>
        toasts.map((toast) =>
          toast.id === id ? { ...toast, ...props } : toast,
        ),
      )

      const { variant, title } = props

      if (variant && title) {
        toastSonner.custom(
          () => <Notification variant={variant} content={title} />,
          {
            id,
            duration: DEFAULT_AUTO_CLOSE_TIME,
          },
        )
      }
    },
    [currentAddress, update],
  )

  const remove = useCallback(
    (id: string) => {
      if (!currentAddress) return
      update(currentAddress, (toasts) => toasts.filter((t) => t.id !== id))
    },
    [currentAddress, update],
  )

  const success = useCallback(
    (toast: ToastParams) => add(toast, "success"),
    [add],
  )
  const error = useCallback((toast: ToastParams) => add(toast, "error"), [add])
  const pending = useCallback(
    (toast: ToastParams) => add(toast, "pending"),
    [add],
  )
  const unknown = useCallback(
    (toast: ToastParams) => add(toast, "unknown"),
    [add],
  )

  return {
    toasts,
    add,
    remove,
    edit,
    success,
    error,
    pending,
    unknown,
  }
}
