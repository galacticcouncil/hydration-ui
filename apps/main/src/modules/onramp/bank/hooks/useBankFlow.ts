import { createContext, useContext } from "react"

import type { BankDirection } from "@/modules/onramp/bank/hooks/useHbr"
import type { BankEntry } from "@/modules/onramp/bank/store/useBankEntryStore"

/**
 * The wizard steps of each bank flow, in order (Figma "Mobile bank": the
 * stepper above the modal). Deposit has no amount step (HBR takes no deposit
 * amount), so the method choice holds its first place. Withdraw is Figma's
 * W01-W15 order; its set-up screens (before W01) show no stepper.
 */
export const BANK_STEPS = {
  deposit: ["method", "verify", "bankDetails", "transfer"],
  withdraw: ["amount", "bankAccount", "review", "transfer"],
} as const

export type BankStepKey =
  | (typeof BANK_STEPS)["deposit"][number]
  | (typeof BANK_STEPS)["withdraw"][number]

export type BankFlowNav = {
  direction: BankDirection
  /** Back from the flow's first screen: the deposit or withdraw method choice. */
  onExit?: () => void
  /** The modal's close: Portfolio, Deposits (the saved status lives there). */
  onClose?: () => void
  /** Set when Portfolio reopened this flow: its target, and no wizard stepper. */
  entry?: BankEntry["target"]
  reopened?: boolean
  /** One id per opening of the flow (a mount of BankFlow): the auto sign-in runs once per open. */
  openId?: number
}

export const BankFlowContext = createContext<BankFlowNav>({
  direction: "deposit",
})

export const useBankFlow = () => useContext(BankFlowContext)
