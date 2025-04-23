import React from "react"
import * as Apps from "@galacticcouncil/apps"
import type { Notification } from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useToast } from "state/toasts"
import type { TemplateResult } from "lit-html"
import { useTransactionLink } from "api/transaction"

const TransactionCenter = createComponent({
  tagName: "gc-transaction-center",
  elementClass: Apps.TransactionCenter,
  react: React,
  events: {
    onNotificationNew: "gc:notification:new" as EventName<
      CustomEvent<Notification>
    >,
  },
})

const isTemplateResult = (e: unknown): e is TemplateResult =>
  e != null && typeof e === "object" && "_$litType$" in e

const getRenderString = (data: TemplateResult): string => {
  const { strings, values } = data

  const v = [...values, ""].map((e) =>
    isTemplateResult(e) ? getRenderString(e) : e,
  )

  return strings.reduce((acc, s, i) => {
    if (v[i] != null) return acc + s + v[i]
    return acc
  }, "")
}

const ToastTitle = ({ message }: { message: Notification["message"] }) => {
  if (typeof message === "string") return <p>{message}</p>

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: getRenderString(message),
      }}
    />
  )
}

const handleNotification = async (
  e: CustomEvent<Notification>,
  toast: any,
  link: any,
): Promise<void> => {
  if (e.detail.toast) {
    const toastVariant = e.detail.type || "info"
    const existingToast = toast.toasts.find(
      (toast: any) => toast.id === e.detail.id,
    )
    if (existingToast) {
      // remove if there is a progrees toast
      toast.remove(e.detail.id)
    }

    const transactionLink = await link({
      blockHash: e.detail.meta?.blockHash,
      txIndex: e.detail.meta?.txIndex,
    })

    toast.add(toastVariant, {
      title: <ToastTitle message={e.detail.message} />,
      id: e.detail.id,
      link: transactionLink,
    })
  } else {
    toast.remove(e.detail.id)
  }
}

type TransactionCenterProps = {
  children: React.ReactNode
}

export const GcTransactionCenter = ({ children }: TransactionCenterProps) => {
  const toast = useToast()
  const { mutateAsync: link } = useTransactionLink()

  return (
    <TransactionCenter
      onNotificationNew={(e) => handleNotification(e, toast, link)}
    >
      {children}
    </TransactionCenter>
  )
}
