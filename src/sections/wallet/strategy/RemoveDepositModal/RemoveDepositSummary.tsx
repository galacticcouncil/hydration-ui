import { UseHealthFactorChangeResult } from "api/borrow"
import { useSpotPrice } from "api/spotPrice"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { TAsset, useAssets } from "providers/assets"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { GDOT_ERC20_ASSET_ID } from "utils/constants"

type Props = {
  readonly hfChange: UseHealthFactorChangeResult
  readonly minReceived: string
  readonly assetReceived: TAsset | null
}

export const RemoveDepositSummary: FC<Props> = ({
  hfChange,
  minReceived,
  assetReceived,
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const gigaDotMeta = getAssetWithFallback(GDOT_ERC20_ASSET_ID)
  const { data } = useSpotPrice(assetReceived?.id, GDOT_ERC20_ASSET_ID)

  return (
    <div>
      <SummaryRow
        label={t("wallet.strategy.deposit.minReceived")}
        withSeparator={!!hfChange}
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
        label={t("wallet.strategy.deposit.minReceived")}
        withSeparator={!!hfChange}
        content={
          <Text fs={14} color="white" tAlign="right">
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
                symbol: gigaDotMeta.symbol,
              })}
            </Trans>
          </Text>
        }
      />
      {hfChange && (
        <SummaryRow
          label={t("healthFactor")}
          content={
            <HealthFactorChange
              healthFactor={hfChange.currentHealthFactor}
              futureHealthFactor={hfChange.futureHealthFactor}
            />
          }
        />
      )}
    </div>
  )
}
