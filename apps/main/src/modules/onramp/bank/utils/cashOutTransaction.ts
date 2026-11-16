import type { PreparedCashOut } from "@/modules/onramp/bank/utils/cashOut"
import { strictEvmCall } from "@/modules/transactions/utils/strictEvm"
import { TransactionInput } from "@/states/transactions"

/**
 * The createTransaction input of a cash-out: approve (when not null), then
 * redeem, both strict. The redeem requires the approve's successful receipt
 * (`after`), is refused from `validUntil` on, and hands its hash, never the
 * approve's, to `onRedeemHash` only once the redeem's receipt is MINED (the
 * final hash after a speed-up; nothing for a cancel or a hash that never
 * mines). HBR pins the first reported hash (HBR #130); with no report it links
 * the burn by its ref, which is safe.
 */
export const buildCashOutTransaction = (args: {
  prepared: PreparedCashOut
  sessionAddress: string
  onRedeemHash: (txHash: string) => void
  copy: {
    approveStep: string
    redeemStep: string
    approveTitle: string
    redeemTitle: string
    toasts: { submitted: string; success: string }
  }
}): TransactionInput => {
  const { prepared, sessionAddress, onRedeemHash, copy } = args
  const notAfter = Date.parse(prepared.validUntil)
  const approve = prepared.approveTx
  // One ledger scope per cash-out: the same approve bytes in another ramp are
  // another hand-over (strictEvmDigest).
  const scope = prepared.rampId
  const redeemStep = {
    stepTitle: copy.redeemStep,
    title: copy.redeemTitle,
    tx: strictEvmCall(prepared.redeemTx),
    toasts: copy.toasts,
    strictEvm: {
      prepared: prepared.redeemTx,
      sessionAddress,
      scope,
      after: approve,
      notAfter,
      onMined: onRedeemHash,
    },
  }
  if (!approve) return { tx: [redeemStep] }
  return {
    tx: [
      {
        stepTitle: copy.approveStep,
        title: copy.approveTitle,
        tx: strictEvmCall(approve),
        strictEvm: { prepared: approve, sessionAddress, scope, notAfter },
      },
      redeemStep,
    ],
  }
}
