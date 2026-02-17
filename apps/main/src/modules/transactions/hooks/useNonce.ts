import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"

import { useAccountInfo, useAccountPermitNonce } from "@/api/account"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const useNonce = (feeAssetId: string) => {
  const wallet = useWallet()

  const isUsingPermit =
    isEthereumSigner(wallet?.signer) && feeAssetId !== NATIVE_EVM_ASSET_ID

  const { data: permitNonce, isLoading: isLoadingPermitNonce } =
    useAccountPermitNonce()
  const { data: accountInfo, isLoading: isLoadingAccountInfo } =
    useAccountInfo()

  return {
    isUsingPermit,
    nonce:
      isUsingPermit && permitNonce ? permitNonce : (accountInfo?.nonce ?? 0),
    isLoading: isLoadingPermitNonce || isLoadingAccountInfo,
  }
}
