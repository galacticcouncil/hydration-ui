import {
  DEFAULT_AUTO_CLOSE_TIME,
  Notification,
  ToastVariant,
} from "@galacticcouncil/ui/components"
import { uuid } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useCallback } from "react"
import { toast as toastSonner } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

export const TOAST_MESSAGES = ["onLoading", "onSuccess", "onError"] as const

export type ToastMessageType = (typeof TOAST_MESSAGES)[number]

type ToastParams = {
  title: string
  id?: string
  link?: string
  bridge?: string
  txHash?: string
  persist?: boolean
  address?: string
  xcm?: "evm" | "substrate" | "solana"
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
      version: 1,
    },
  ),
)

export const useToasts = () => {
  const currentAddress = useAccount().account?.address
  const { update } = useToastsStore()

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
          //remove toasts with same id and set max 10
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

  const successToast = useCallback(
    (toast: ToastParams) => add(toast, "success"),
    [add],
  )
  const errorToast = useCallback(
    (toast: ToastParams) => add(toast, "error"),
    [add],
  )
  const loadingToast = useCallback(
    (toast: ToastParams) => add(toast, "submitted"),
    [add],
  )
  const unknownToast = useCallback(
    (toast: ToastParams) => add(toast, "unknown"),
    [add],
  )

  return {
    toasts,
    add,
    remove,
    edit,
    successToast,
    errorToast,
    loadingToast,
    unknownToast,
  }
}
