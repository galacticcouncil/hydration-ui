import { API_ETH_MOCK_ADDRESS, PERMISSION } from "@aave/contract-helpers"
import React from "react"
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { usePermissions } from "sections/lending/hooks/usePermissions"
import { useRootStore } from "sections/lending/store/root"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TxErrorView } from "./Error"
import { TxErrorType } from "sections/lending/ui-config/errorMapping"

export interface ModalWrapperRenderProps {
  underlyingAsset: string
  poolReserve: ComputedReserveData
  userReserve: ComputedUserReserveData
  symbol: string
  tokenBalance: string
  nativeBalance: string
  isWrongNetwork: boolean
  action?: string
}

type ModalWrapperProps = {
  underlyingAsset: string
  requiredChainId?: number
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean
  requiredPermission?: PERMISSION
  action?: string
}

export const ModalWrapper: React.FC<
  ModalWrapperProps & {
    title: string
    hideTitleSymbol?: boolean
    children: (props: ModalWrapperRenderProps) => React.ReactNode
  }
> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  requiredPermission,
  keepWrappedSymbol,
}) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const { mainTxState, close } = useModalContext()

  const result = useBorrowModalWrapper({
    underlyingAsset,
    requiredChainId: _requiredChainId,
    requiredPermission,
    keepWrappedSymbol,
  })

  /* const { isWrongNetwork, requiredChainId } =
    useIsWrongNetwork(_requiredChainId) */

  if (result.type === "error") {
    return <TxErrorView txError={result.txError} />
  }

  if (result.permissionDenied && currentMarketData.permissionComponent) {
    return <>{currentMarketData.permissionComponent}</>
  }

  const { poolReserve, symbol } = result.data

  const modalTitle = !mainTxState.success ? title : ""
  const fullModalTitle =
    `${modalTitle}${hideTitleSymbol ? "" : ` ${symbol}`}`.toUpperCase()

  return (
    <AssetCapsProvider asset={poolReserve}>
      <ModalContents
        onClose={close}
        sx={{ color: "white" }}
        contents={[
          {
            title: fullModalTitle,
            content: <>{children(result.data)}</>,
          },
        ]}
      />
    </AssetCapsProvider>
  )
}

type Result =
  | { type: "error"; txError: TxErrorType }
  | {
      type: "success"
      permissionDenied: boolean
      data: ModalWrapperRenderProps
    }

export const useBorrowModalWrapper = ({
  underlyingAsset,
  requiredChainId: _requiredChainId,
  requiredPermission,
  keepWrappedSymbol,
}: ModalWrapperProps): Result => {
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const currentNetworkConfig = useRootStore(
    (store) => store.currentNetworkConfig,
  )
  const { walletBalances } = useWalletBalances(currentMarketData)
  const { user, reserves } = useAppDataContext()
  const { txError } = useModalContext()
  const { permissions } = usePermissions()

  if (txError && txError.blocking) {
    return { type: "error", txError }
  }

  const permissionDenied =
    !!requiredPermission &&
    !!isFeatureEnabled.permissions(currentMarketData) &&
    !permissions.includes(requiredPermission)

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

  const symbol =
    poolReserve?.isWrappedBaseAsset && !keepWrappedSymbol
      ? currentNetworkConfig?.baseAssetSymbol
      : poolReserve?.symbol

  return {
    type: "success",
    permissionDenied,
    data: {
      isWrongNetwork: false,
      nativeBalance:
        walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || "0",
      tokenBalance:
        walletBalances[poolReserve?.underlyingAsset?.toLowerCase()]?.amount ||
        "0",
      poolReserve,
      symbol,
      underlyingAsset,
      userReserve,
    },
  }
}
