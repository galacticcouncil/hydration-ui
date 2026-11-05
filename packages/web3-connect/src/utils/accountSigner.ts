import { accountPublicKey } from "@galacticcouncil/utils"

import type { Account } from "@/hooks/useWeb3Connect"
import { EthereumSigner } from "@/signers/EthereumSigner"
import type { Wallet } from "@/types/wallet"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

/** Resolve a local source signer without mutating the wallet's active signer. */
export const getAccountSigner = (wallet: Wallet, account: Account) => {
  if (wallet.provider !== account.provider || !wallet.enabled) return undefined
  const address = account.isMultisig
    ? (account.multisigSignerAddress ?? account.address)
    : account.address
  if (wallet instanceof BaseSubstrateWallet) {
    const publicKey = accountPublicKey(address)
    if (!publicKey) return undefined
    return wallet
      .getInjectedAccounts()
      .find((item) => accountPublicKey(item.address) === publicKey)
      ?.polkadotSigner
  }
  if (wallet.signer instanceof EthereumSigner)
    return new EthereumSigner(account.rawAddress, wallet.signer.provider)
  return wallet.signer
}
