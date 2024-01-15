import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Heading } from "components/Typography/Heading/Heading"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { theme } from "theme"
import { separateBalance } from "utils/balance"
import { useDisplayAssetStore } from "utils/displayAsset"

type DataProps = {
  value?: BN
  isLoading: boolean
  fontSize?: [number, number]
  isOnlyDollar?: boolean
}

export const HeaderTotalData = ({
  value,
  isLoading,
  fontSize,
  isOnlyDollar,
}: DataProps) => {
  const { t } = useTranslation()
  const displayAsset = useDisplayAssetStore()

  const isFiat = displayAsset.isStableCoin || displayAsset.isFiat

  if (isLoading)
    return <Skeleton sx={{ height: fontSize ?? [19, 28], width: [180, 200] }} />

  return (
    <Heading
      as="h3"
      sx={{ fontSize: fontSize ?? [19, 28], fontWeight: 500 }}
      css={{ whiteSpace: "nowrap" }}
    >
      {isOnlyDollar ? (
        t("value.usd", { amount: value })
      ) : (
        <DisplayValue
          withGap
          value={
            <Trans
              t={t}
              i18nKey="wallet.assets.header.value"
              tOptions={{
                ...separateBalance(value, {
                  type: isFiat ? "dollar" : "token",
                }),
              }}
            >
              <span css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }} />
            </Trans>
          }
        />
      )}
    </Heading>
  )
}
