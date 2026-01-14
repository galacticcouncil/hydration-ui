import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { CallType } from "@galacticcouncil/xc-core"

import { SingleTransaction } from "@/states/transactions"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const useTransactionEcosystem = (
  transaction: SingleTransaction,
): CallType => {
  const wallet = useWallet()

  const { fee, meta } = transaction
  const chain = chainsMap.get(meta?.srcChainKey)

  if (!chain) return CallType.Substrate

  const isNativeHydrationEvmCall =
    chain.key === HYDRATION_CHAIN_KEY &&
    isEthereumSigner(wallet?.signer) &&
    fee?.feePaymentAssetId === NATIVE_EVM_ASSET_ID

  const isExternalParachainEvmCall =
    chain.key !== HYDRATION_CHAIN_KEY &&
    chain.isEvmParachain() &&
    isEthereumSigner(wallet?.signer)

  switch (true) {
    case isNativeHydrationEvmCall:
    case isExternalParachainEvmCall:
    case chain.isEvmChain():
      return CallType.Evm
    case chain.isSolana():
      return CallType.Solana
    default:
      return CallType.Substrate
  }
}
