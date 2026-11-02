import { NearChain, NearTxOutcome } from "@galacticcouncil/xc-core"
import {
  getFailures,
  NearCall,
  NearFunctionCall,
  NearSigner as XcNearSigner,
  NearTxObserver,
  NearWallet,
  NearWalletAction,
} from "@galacticcouncil/xc-sdk"

import {
  isEthImplicitAccount,
  NearTxCallbacks,
  reportNearSend,
  toSingleActions,
} from "@/utils/near"

export type NearTxStatus = NearTxOutcome

/** A wallet taking several transactions in one request, as near-connect's do. */
type NearBatchWallet = NearWallet & {
  signAndSendTransactions(params: {
    signerId?: string
    transactions: { receiverId: string; actions: NearWalletAction[] }[]
  }): Promise<NearTxOutcome[] | void>
}

const isBatchWallet = (wallet: NearWallet): wallet is NearBatchWallet =>
  "signAndSendTransactions" in wallet

const toWalletAction = ({
  methodName,
  args,
  gas,
  deposit,
}: NearFunctionCall): NearWalletAction => ({
  type: "FunctionCall",
  params: {
    methodName,
    args,
    gas: gas.toString(),
    deposit: deposit.toString(),
  },
})

/**
 * Sends a call's actions as one transaction each, in a single wallet request.
 *
 * - The wallet runs them in order, each final before the next, and fails
 *   saying how many completed. Those stay done: NEAR wrapped to wNEAR is
 *   spent by the next attempt instead of wrapped again
 * - The last transaction is reported, the one carrying the transfer
 * - Fails if a receipt failed anywhere in any of them
 */
const sendSingleActions = async (
  wallet: NearBatchWallet,
  { from, receiverId, actions }: NearCall,
  observer: NearTxObserver,
) => {
  try {
    const outcomes = await wallet.signAndSendTransactions({
      signerId: from,
      transactions: toSingleActions(actions).map((action) => ({
        receiverId,
        actions: [toWalletAction(action)],
      })),
    })

    const outcome = outcomes?.at(-1)
    if (!outcomes || !outcome) return

    observer.onTransactionSend(outcome.transaction.hash)
    observer.onStatus?.(outcome)

    const failures = outcomes.flatMap((o) => getFailures(o))
    if (failures.length > 0) {
      throw new Error(
        outcome.transaction.hash + " failed: " + JSON.stringify(failures),
      )
    }
  } catch (err) {
    observer.onError(err)
  }
}

/** Signs in the connected NEAR wallet, which submits the transaction itself. */
export class NearSigner {
  wallet: NearWallet

  constructor(wallet: NearWallet) {
    this.wallet = wallet
  }

  async signAndSend(
    call: NearCall,
    chain: NearChain,
    options: NearTxCallbacks,
  ) {
    const { wallet } = this

    // A NEP-518 account takes one action per transaction, so its calls are
    // split; elsewhere the actions run atomically in one transaction
    if (
      isEthImplicitAccount(call.from) &&
      call.actions.length > 1 &&
      isBatchWallet(wallet)
    ) {
      return reportNearSend(
        (observer) => sendSingleActions(wallet, call, observer),
        options,
      )
    }

    const signer = new XcNearSigner(chain, wallet)
    return reportNearSend(
      (observer) => signer.signAndSend(call, observer),
      options,
    )
  }
}
