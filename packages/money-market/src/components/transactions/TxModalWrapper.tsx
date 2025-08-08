import { API_ETH_MOCK_ADDRESS, PERMISSION } from "@aave/contract-helpers"
import React from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "@/hooks/app-data-provider/useWalletBalances"
import {
  ComputedReserveData,
  ComputedUserReserveData,
} from "@/hooks/commonTypes"
import { AssetCapsProvider } from "@/hooks/useAssetCaps"
import { useModalContext } from "@/hooks/useModal"
import { usePermissions } from "@/hooks/usePermissions"
import { useRootStore } from "@/store/root"
import { isFeatureEnabled } from "@/utils/marketsAndNetworksConfig"

export type TxModalWrapperRenderProps = {
  underlyingAsset: string
  poolReserve: ComputedReserveData
  userReserve: ComputedUserReserveData
  symbol: string
  tokenBalance: string
  nativeBalance: string
  action?: string
}

export type TxModalWrapperProps = {
  underlyingAsset: string
  requiredChainId?: number
  requiredPermission?: PERMISSION
  children: (props: TxModalWrapperRenderProps) => React.ReactNode
  action?: string
}

export const TxModalWrapper: React.FC<TxModalWrapperProps> = ({
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  requiredPermission,
}) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData)

  const { walletBalances } = useWalletBalances(currentMarketData)
  const { user, reserves } = useAppDataContext()
  const { txError } = useModalContext()
  const { permissions } = usePermissions()

  if (txError && txError.blocking) {
    return <span>Transaction failed</span>
  }

  if (
    requiredPermission &&
    isFeatureEnabled.permissions(currentMarketData) &&
    !permissions.includes(requiredPermission) &&
    currentMarketData.permissionComponent
  ) {
    return <>{currentMarketData.permissionComponent}</>
  }

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset?.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve?.isWrappedBaseAsset
    return underlyingAsset === reserve.underlyingAsset
  }) as ComputedReserveData

  const userReserve = user?.userReservesData.find((userReserve) => {
    if (underlyingAsset?.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return userReserve?.reserve?.isWrappedBaseAsset
    return underlyingAsset === userReserve?.underlyingAsset
  }) as ComputedUserReserveData

  return (
    <AssetCapsProvider asset={poolReserve}>
      {children({
        nativeBalance:
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || "0",
        tokenBalance:
          walletBalances[poolReserve?.underlyingAsset?.toLowerCase()]?.amount ||
          "0",
        poolReserve,
        symbol: poolReserve?.symbol,
        underlyingAsset,
        userReserve,
      })}
    </AssetCapsProvider>
  )
}
