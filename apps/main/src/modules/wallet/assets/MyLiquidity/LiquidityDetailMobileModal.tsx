import { Amount, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { SAssetDetailModalBody } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { LiquidityDetailMobileActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileActions"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { LiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionsMobile"
import {
  XYKPosition,
  XYKPositionDeposit,
} from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import {
  LiquidityPositionByAsset,
  StableswapPosition,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { isShareToken } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

type Props = {
  readonly detail: LiquidityPositionByAsset
  readonly onAddLiquidity: (assetId: string) => void
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition | XYKPositionDeposit,
    assetId: string,
  ) => void
  readonly onXykSharesAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: XYKPosition,
  ) => void
  readonly onStableSwapAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add,
    position: StableswapPosition,
  ) => void
}

export const LiquidityDetailMobileModal: FC<Props> = ({
  detail,
  onAddLiquidity,
  onLiquidityAction,
  onXykSharesAction,
  onStableSwapAction,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const format = useFormatOmnipoolPositionData()

  const {
    meta,
    currentValueHuman,
    currentHubValueHuman,
    currentTotalDisplay,
    positions,
  } = detail

  const isXykShares = isShareToken(meta)
  const assetId = isXykShares ? meta.poolAddress : meta.id

  return (
    <>
      <ModalHeader sx={{ p: 16 }} title={meta.symbol} description={meta.name} />
      <SAssetDetailModalBody>
        <Amount
          value={
            isXykShares
              ? t("common:currency", {
                  value: currentValueHuman,
                  symbol: "Shares",
                })
              : format({ meta, currentValueHuman, currentHubValueHuman })
          }
          displayValue={t("common:currency", {
            value: currentTotalDisplay,
          })}
        />
        <SAssetDetailMobileSeparator />
        <LiquidityDetailMobileActions
          assetId={isXykShares ? meta.poolAddress : meta.id}
          onAddLiquidity={() => onAddLiquidity(assetId)}
        />
        <SAssetDetailMobileSeparator />
        <LiquidityPositionsMobile
          asset={meta}
          positions={positions}
          onLiquidityAction={(action, position) =>
            onLiquidityAction(action, position, assetId)
          }
          onXykSharesAction={onXykSharesAction}
          onStableSwapAction={onStableSwapAction}
        />
      </SAssetDetailModalBody>
    </>
  )
}
