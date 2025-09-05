import { UseHealthFactorChangeResult } from "api/borrow"
import { useSpotPrice } from "api/spotPrice"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { TAsset, useAssets } from "providers/assets"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { LiquidityLimitField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"

type Props = {
  readonly assetId: string
  readonly hfChange: UseHealthFactorChangeResult
  readonly minReceived: string
  readonly assetReceived: TAsset | null
  readonly setLiquidityLimit: () => void
}

export const RemoveDepositSummary: FC<Props> = ({
  assetId,
  hfChange,
  minReceived,
  assetReceived,
  setLiquidityLimit,
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const meta = getAssetWithFallback(assetId)
  const { data, isLoading } = useSpotPrice(assetReceived?.id, assetId)

  return (
    <div>
      <LiquidityLimitField
        setLiquidityLimit={setLiquidityLimit}
        withSeparator
        type="swap"
      />
      <SummaryRow
        label={t("wallet.strategy.deposit.minReceived")}
        withSeparator
        content={
          <Text fw={500} fs={14} lh="1" color="white">
            {t("value.tokenApproxWithSymbol", {
              value: minReceived,
              symbol: assetReceived?.symbol,
            })}
          </Text>
        }
      />
      <SummaryRow
        label={t("price")}
        withSeparator={!!hfChange}
        content={
          <Text fs={14} color="white" tAlign="right">
            {isLoading ? (
              <Skeleton width={100} height="1em" />
            ) : (
              <Trans
                t={t}
                i18nKey="liquidity.add.modal.row.spotPrice"
                tOptions={{
                  firstAmount: 1,
                  firstCurrency: assetReceived?.symbol,
                }}
              >
                {t("value.tokenWithSymbol", {
                  value: data?.spotPrice.toString(),
                  symbol: meta.symbol,
                })}
              </Trans>
            )}
          </Text>
        }
      />
    </div>
  )
}
