import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Heading } from "components/Typography/Heading/Heading"
import { ReactNode } from "react"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { theme } from "theme"
import { separateBalance } from "utils/balance"
import { ResponsiveValue } from "utils/responsive"

type DataProps = {
  value?: BN
  subValue?: ReactNode
  isLoading: boolean
  fontSize?: ResponsiveValue<number>
  isOnlyDollar?: boolean
}

export const HeaderTotalData = ({
  value,
  subValue,
  isLoading,
  fontSize,
  isOnlyDollar,
}: DataProps) => {
  const { t } = useTranslation()

  if (isLoading)
    return <Skeleton sx={{ height: fontSize ?? [19, 28], width: [180, 200] }} />

  return (
    <div sx={{ flex: "column", align: ["end", "start"] }}>
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
                tOptions={{ ...separateBalance(value, { type: "dollar" }) }}
              >
                <span css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }} />
              </Trans>
            }
          />
        )}
      </Heading>
      {subValue}
    </div>
  )
}
