import { Text } from "components/Typography/Text/Text"
import { Heading } from "components/Typography/Heading/Heading"
import { Separator } from "components/Separator/Separator"
import { Trans, useTranslation } from "react-i18next"
import {
  useVestingClaimableBalance,
  useVestingTotalVestedAmount,
} from "api/vesting"
import { useSpotPrice } from "api/spotPrice"
import { useAUSD } from "api/asset"
import { useMemo } from "react"
import { getFormatSeparators } from "utils/formatting"
import i18n from "i18next"
import { css } from "@emotion/react"
import { theme } from "theme"
import { NATIVE_ASSET_ID } from "utils/api"
import { useAssetMeta } from "../../../api/assetMeta"

export const WalletVestingHeader = () => {
  const { t } = useTranslation()

  const { data: claimableBalance } = useVestingClaimableBalance()
  const { data: totalVestedAmount } = useVestingTotalVestedAmount()

  const AUSD = useAUSD()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, AUSD.data?.id)
  const { data: nativeAsset } = useAssetMeta(NATIVE_ASSET_ID)

  const claimableUSD = useMemo(() => {
    if (claimableBalance && spotPrice.data) {
      return claimableBalance.times(spotPrice.data.spotPrice)
    }
    return null
  }, [claimableBalance, spotPrice])

  const separators = getFormatSeparators(i18n.languages[0])

  const [num, denom] = t("value", {
    value: claimableBalance,
    fixedPointScale: 12,
    decimalPlaces: 2,
  }).split(separators.decimal ?? ".")

  const totalVestedValue = t("value", {
    value: totalVestedAmount,
    fixedPointScale: nativeAsset?.data?.decimals ?? 12,
    decimalPlaces: 2,
  }).split(separators.decimal ?? ".")

  const totalVestedUSD = useMemo(() => {
    if (totalVestedAmount && spotPrice.data) {
      return totalVestedAmount.times(spotPrice.data.spotPrice)
    }
    return null
  }, [totalVestedAmount, spotPrice])

  return (
    <div
      sx={{ flex: ["column", "row"], mb: 40 }}
      css={{ "> *:not([role='separator'])": { flex: 1 } }}
    >
      <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
        <Text color="neutralGray300" sx={{ mb: 14 }}>
          {t("wallet.vesting.claimable")}
        </Text>

        {/* TODO: add skeleton loader */}
        <div sx={{ flex: "row", align: "start" }}>
          <Heading as="h3" sx={{ fontSize: [16, 58], fontWeight: 900 }}>
            <Trans
              t={t}
              i18nKey="wallet.vesting.claimable.value"
              tOptions={{ num, denom }}
            >
              <span
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                  font-size: 32px;
                `}
              />
            </Trans>
          </Heading>
        </div>
        <Text
          sx={{
            mt: 10,
          }}
          color="neutralGray300"
          fs={16}
          lh={18}
        >
          {t("value.usd", { amount: claimableUSD })}
        </Text>
      </div>
      <Separator sx={{ mb: 12, display: ["inherit", "none"] }} />
      <div sx={{ flex: ["row", "column"], justify: ["start", "center"] }}>
        <Text color="neutralGray300" sx={{ mb: 14 }}>
          {t("wallet.vesting.total_vested")}
        </Text>
        <div sx={{ flex: "row", align: "start" }}>
          <Heading as="h3" sx={{ fontSize: [16, 34], fontWeight: 900 }}>
            <Trans
              t={t}
              i18nKey="wallet.vesting.total_vested.value"
              tOptions={{
                num: totalVestedValue[0],
                denom: totalVestedValue[1],
              }}
            >
              <span
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                  font-size: 16px;
                `}
              />
            </Trans>
          </Heading>
        </div>
        <Text
          sx={{
            mt: 3,
          }}
          color="neutralGray300"
          fs={16}
          lh={18}
        >
          {t("value.usd", { amount: totalVestedUSD })}
        </Text>
      </div>
    </div>
  )
}
