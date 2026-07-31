import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  isEthereumSigner,
  useAccount,
  useWallet,
} from "@galacticcouncil/web3-connect"

import { useAccountInfo, useAccountPermitNonce } from "@/api/account"
import { useTransactionsStore } from "@/states/transactions"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const useNonce = (feeAssetId: string) => {
  const wallet = useWallet()
  const { account } = useAccount()

  const isUsingPermit =
    isEthereumSigner(wallet?.signer) && feeAssetId !== NATIVE_EVM_ASSET_ID

  const { data: permitNonce, isLoading: isLoadingPermitNonce } =
    useAccountPermitNonce({
      enabled: isUsingPermit,
    })
  const { data: accountInfo, isLoading: isLoadingAccountInfo } =
    useAccountInfo()

  const pendingTransactions = useTransactionsStore(
    (state) => state.pendingTransactions,
  )

  const chainNonce = accountInfo?.nonce ?? 0

  const pendingNonces = pendingTransactions
    .filter(
      (tx) =>
        !tx.isPermit &&
        tx.address === account?.address &&
        tx.meta.srcChainKey === HYDRATION_CHAIN_KEY &&
        tx.nonce >= chainNonce,
    )
    .map((tx) => tx.nonce)

  // Optimistically increment the substrate nonce for the next transaction
  const substrateNonce = pendingNonces.length
    ? Math.max(...pendingNonces) + 1
    : chainNonce

  return {
    isUsingPermit,
    nonce: isUsingPermit && permitNonce ? permitNonce : substrateNonce,
    isLoading: isLoadingPermitNonce || isLoadingAccountInfo,
  }
}
