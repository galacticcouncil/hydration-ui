import {
  SuiSignTransactionInput,
  WalletAccount,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard"
import { Transaction } from "@mysten/sui/transactions"
import { SuiChain } from "@galacticcouncil/xcm-core"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
export { type SignedTransaction as SuiSignedTransaction } from "@mysten/wallet-standard"

export class SuiSigner {
  account: WalletAccount
  provider: WalletWithRequiredFeatures
  constructor(account: WalletAccount, provider: WalletWithRequiredFeatures) {
    this.account = account
    this.provider = provider
  }
  async signAndSend(data: string) {
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

    return wallet.signTransaction(params)
  }
}
