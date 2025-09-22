import { useSpotPrice } from "api/spotPrice"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { TAsset } from "providers/assets"
import { Trans, useTranslation } from "react-i18next"

export const PriceSummaryRow = ({
  selectedAsset,
  poolAsset,
}: {
  selectedAsset: TAsset
  poolAsset: TAsset
}) => {
  const { t } = useTranslation()
  const { data: spotPrice } = useSpotPrice(poolAsset.id, selectedAsset.id)

  return (
    <SummaryRow
      label={t("liquidity.remove.modal.price")}
      withSeparator
      content={
        <Text fs={14} color="white" tAlign="right">
          <Trans
            t={t}
            i18nKey="liquidity.add.modal.row.spotPrice"
            tOptions={{
              firstAmount: 1,
              firstCurrency: poolAsset.symbol,
            }}
          >
            {t("value.tokenWithSymbol", {
              value: spotPrice?.spotPrice.toString(),
              symbol: selectedAsset.symbol,
            })}
          </Trans>
        </Text>
      }
    />
  )
}
