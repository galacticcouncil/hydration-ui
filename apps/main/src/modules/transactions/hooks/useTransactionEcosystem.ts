import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { CallType } from "@galacticcouncil/xcm-core"

import { Transaction } from "@/states/transactions"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const useTransactionEcosystem = (transaction: Transaction): CallType => {
  const wallet = useWallet()

  const { fee, meta } = transaction
  const chain = chainsMap.get(meta?.srcChainKey)

  if (!chain) return CallType.Substrate

  const isNativeHydrationEvmCall =
    chain.key === HYDRATION_CHAIN_KEY &&
    isEthereumSigner(wallet?.signer) &&
    fee?.feePaymentAssetId === NATIVE_EVM_ASSET_ID

  switch (true) {
    case isNativeHydrationEvmCall:
    case chain.isEvmChain():
    case chain.isEvmParachain() && isEthereumSigner(wallet?.signer):
      return CallType.Evm
    case chain.isSolana():
      return CallType.Solana
    default:
      return CallType.Substrate
  }
}
