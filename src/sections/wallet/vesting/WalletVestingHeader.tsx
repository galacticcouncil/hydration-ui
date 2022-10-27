import { Text } from "../../../components/Typography/Text/Text"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Separator } from "../../../components/Separator/Separator"
import { Trans, useTranslation } from "react-i18next"
import { useVestingClaimableBalance } from "../../../api/vesting"
import { useSpotPrice } from "../../../api/spotPrice"
import { useAUSD } from "../../../api/asset"
import { NATIVE_ASSET_ID } from "../../../utils/network"
import { useMemo } from "react"
import { getFormatSeparators } from "../../../utils/formatting"
import i18n from "i18next"
import { css } from "@emotion/react"
import { theme } from "../../../theme"

export const WalletVestingHeader = () => {
  const { t } = useTranslation()

  const { data: claimableBalance } = useVestingClaimableBalance()
  const AUSD = useAUSD()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, AUSD.data?.id)

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
      <div sx={{ flex: ["row", "column"], justify: "start" }}>
        <Text color="neutralGray300" sx={{ mb: 14 }}>
          {t("wallet.vesting.total_vested")}
        </Text>
        <div sx={{ flex: "row", align: "start" }}>
          <Heading as="h3" sx={{ fontSize: [16, 58], fontWeight: 900 }}>
            {t("value.usd", { amount: "2" })}
          </Heading>
        </div>
      </div>
    </div>
  )
}
