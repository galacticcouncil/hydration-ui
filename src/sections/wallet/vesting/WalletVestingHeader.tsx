import { Text } from "components/Typography/Text/Text"
import { Heading } from "components/Typography/Heading/Heading"
import { Trans, useTranslation } from "react-i18next"
import { useVestingScheduleEnd, useVestingTotalVestedAmount } from "api/vesting"
import { useSpotPrice } from "api/spotPrice"
import { useUsdPeggedAsset } from "api/asset"
import { useMemo } from "react"
import { css } from "@emotion/react"
import { theme } from "theme"
import { NATIVE_ASSET_ID } from "utils/api"
import { useAssetMeta } from "../../../api/assetMeta"
import { STable, SSeparator } from "./WalletVestingHeader.styled"
import { addDays } from "date-fns"
import { BN_0, DAY_IN_MILLISECONDS } from "../../../utils/constants"
import { separateBalance } from "utils/balance"

export const WalletVestingHeader = () => {
  const { t } = useTranslation()

  const { data: totalVestedAmount } = useVestingTotalVestedAmount()
  const { data: vestingScheduleEnd } = useVestingScheduleEnd()

  const usd = useUsdPeggedAsset()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, usd.data?.id)
  const { data: nativeAsset } = useAssetMeta(NATIVE_ASSET_ID)

  const totalVestedValue = totalVestedAmount ?? BN_0

  const totalVestedUSD = useMemo(() => {
    if (totalVestedValue && spotPrice.data) {
      return totalVestedValue.times(spotPrice.data.spotPrice)
    }
    return null
  }, [totalVestedValue, spotPrice])

  return (
    <div
      sx={{
        flex: ["column", "row"],
        mb: 40,
        align: "center",
        justify: "space-between",
      }}
    >
      <div sx={{ flex: ["column", "row"], width: "100%" }}>
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="brightBlue300">{t("wallet.vesting.total_vested")}</Text>
          <div sx={{ flex: "row", align: "start" }}>
            <Heading as="h3" lh={[25, 42]} sx={{ fontSize: [19, 34] }}>
              <Trans
                t={t}
                i18nKey="wallet.vesting.total_vested.value"
                tOptions={{
                  ...separateBalance(totalVestedValue, {
                    fixedPointScale: nativeAsset?.decimals ?? 12,
                    decimalPlaces: 2,
                  }),
                  symbol: nativeAsset?.symbol,
                }}
              >
                <span
                  sx={{ fontSize: [19, 21] }}
                  css={css`
                    color: rgba(${theme.rgbColors.white}, 0.4);
                  `}
                />
              </Trans>
            </Heading>
          </div>
          <Text
            sx={{
              display: ["none", "inherit"],
            }}
            css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }}
          >
            {t("value.usd", { amount: totalVestedUSD })}
          </Text>
        </div>
      </div>
      <SSeparator sx={{ display: ["none", "inherit"] }} />
      {vestingScheduleEnd && (
        <STable>
          <div>
            <Text color="pink500" fs={[14, 16]} sx={{ mb: 10 }}>
              {t("wallet.vesting.vesting_days_left")}
            </Text>
            <Text
              color="white"
              fs={[15, 19]}
              font="FontOver"
              tTransform="uppercase"
            >
              {t("wallet.vesting.vesting_days_left_value", {
                count: vestingScheduleEnd.div(DAY_IN_MILLISECONDS).isLessThan(0)
                  ? 0
                  : Math.ceil(
                      vestingScheduleEnd.div(DAY_IN_MILLISECONDS).toNumber(),
                    ),
              })}
            </Text>
          </div>
          <SSeparator />
          <div>
            <Text color="pink500" fs={[14, 16]} sx={{ mb: 10 }}>
              {t("wallet.vesting.vesting_schedule_end")}
            </Text>
            <Text
              color="white"
              fs={[15, 19]}
              font="FontOver"
              tTransform="uppercase"
            >
              {t("wallet.vesting.vesting_schedule_end_value", {
                date: addDays(
                  new Date(),
                  vestingScheduleEnd.div(DAY_IN_MILLISECONDS).toNumber(),
                ),
              })}
            </Text>
          </div>
        </STable>
      )}
    </div>
  )
}
