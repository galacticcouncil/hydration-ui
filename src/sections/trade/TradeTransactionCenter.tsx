import React from "react"
import * as Apps from "@galacticcouncil/apps"
import type { Notification } from "@galacticcouncil/apps/dist/types/component/notification/types"
import { createComponent, EventName } from "@lit-labs/react"
import { useToast } from "state/toasts"
import type { TemplateResult } from "lit-html"

const TransactionCenter = createComponent({
  tagName: "gc-transaction-center",
  elementClass: Apps.TransactionCenter,
  react: React,
  events: {
    onGCNotification: "gc:notification:new" as EventName<
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

const getToastTitle = (message: Notification["message"]) => {
  if (typeof message === "string") return <p>{message}</p>

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: getRenderString(message),
      }}
    />
  )
}

type TradeTransactionCenterProps = {
  children: React.ReactNode
}

export const TradeTransactionCenter = ({
  children,
}: TradeTransactionCenterProps) => {
  const toast = useToast()

  return (
    <TransactionCenter
      onGCNotification={(e) => {
        if (e.detail.toast) {
          const toastVariant = e.detail.type === "" ? "info" : e.detail.type
          const existingToast = toast.toasts.find(
            (toast) => toast.id === e.detail.id,
          )

          // it can be removed after the duplicated event listener is deleted on trade app
          const isDuplicatedEvent = existingToast?.variant === e.detail.type
          if (isDuplicatedEvent) return

          if (existingToast) {
            // remove if there is a progrees toast
            toast.remove(e.detail.id)
          }
          toast.add(toastVariant, {
            title: getToastTitle(e.detail.message),
            id: e.detail.id,
          })
        } else {
          toast.remove(e.detail.id)
        }
      }}
    >
      {children}
    </TransactionCenter>
  )
}
