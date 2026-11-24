import type { PreparedEvmTransaction } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"

import type { PreparedCashOut } from "@/modules/onramp/bank/utils/cashOut"
import { strictEvmCall } from "@/modules/transactions/utils/strictEvm"
import { TransactionInput } from "@/states/transactions"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

/** Thrown before any wallet input is built for a fixture (demonstration) build. */
export class FixtureCashOutRefusal extends Error {
  constructor() {
    super("A fixture cash-out build is a demonstration; it is never signed.")
    this.name = "FixtureCashOutRefusal"
  }
}

/**
 * Invariant 2b of the fixture demonstration: a step that names no contract
 * (the zero address) or carries no calldata is a fixture build
 * (`fixtureDemoTx`, config/fixtures.ts). It is recognised by its content, not
 * by a flag a caller could forget to pass. A real build's approve (HOLLAR
 * `approve`) and redeem (facilitator `redeem`) always call a contract with
 * calldata, so no build of the HBR server is refused here.
 */
const isFixtureStep = (tx: PreparedEvmTransaction) =>
  tx.to.toLowerCase() === ZERO_ADDRESS || tx.data === "0x"

export const isFixtureCashOut = (prepared: PreparedCashOut) =>
  isFixtureStep(prepared.redeemTx) ||
  (prepared.approveTx !== null && isFixtureStep(prepared.approveTx))

/**
 * The createTransaction input of a cash-out: approve (when not null), then
 * redeem, both strict. The redeem requires the approve's successful receipt
 * (`after`), is refused from `validUntil` on, and hands its hash, never the
 * approve's, to `onRedeemHash` only once the redeem's receipt is MINED (the
 * final hash after a speed-up; nothing for a cancel or a hash that never
 * mines). HBR pins the first reported hash (HBR #130); with no report it links
 * the burn by its ref, which is safe. A fixture build is refused first
 * (FixtureCashOutRefusal), before anything is constructed.
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
  // Invariant 2b: holds even if a caller hands a fixture build over by mistake.
  if (isFixtureCashOut(prepared)) throw new FixtureCashOutRefusal()
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
