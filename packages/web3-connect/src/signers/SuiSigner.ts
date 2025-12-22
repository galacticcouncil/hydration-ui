import { chainsMap } from "@galacticcouncil/xc-cfg"
import { SuiChain } from "@galacticcouncil/xc-core"
import { SuiTransactionBlockResponse } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import {
  SuiSignTransactionInput,
  WalletAccount,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard"
export { type SignedTransaction as SuiSignedTransaction } from "@mysten/wallet-standard"

export type SuiTxStatus = SuiTransactionBlockResponse

type SuiSignerOptions = {
  onSubmitted: (txHash: string) => void
  onSuccess: (status: SuiTransactionBlockResponse) => void
  onError: (error: string) => void
  onFinalized: (status: SuiTransactionBlockResponse) => void
}

export class SuiSigner {
  account: WalletAccount
  provider: WalletWithRequiredFeatures
  constructor(account: WalletAccount, provider: WalletWithRequiredFeatures) {
    this.account = account
    this.provider = provider
  }
  async signAndSend(data: string, options: SuiSignerOptions) {
    const chain = chainsMap.get("sui")

    if (!(chain instanceof SuiChain)) {
      throw new Error("Unsupported chain")
    }

    const transaction = Transaction.from(data)

    const params: SuiSignTransactionInput = {
      transaction,
      account: this.account,
      chain: "sui:mainnet",
    }

    const wallet = this.provider.features["sui:signTransaction"]
    if (!wallet) {
      throw new Error("Wallet does not support sui:signTransaction feature.")
    }

    try {
      const { bytes, signature } = await wallet.signTransaction(params)
      const { digest: txHash } = await chain.client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      })

      options.onSubmitted(txHash)

      const block = await chain.client.getTransactionBlock({
        digest: txHash,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      })

      const isSuccess = block.effects?.status.status === "success"

      if (isSuccess) {
        options.onSuccess(block)
      } else {
        options.onError(block.effects?.status.error ?? "Unknown SUI error")
      }

      options.onFinalized(block)

      return block
    } catch (error) {
      options.onError(
        error instanceof Error ? error.message : "Error signing transaction",
      )
      throw error
    }
  }
}
