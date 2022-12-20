import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { css } from "@emotion/react"

type Props = {
  symbol: string
  amount: BN
  amountUSD: BN
  shares: BN
}

export const WalletAssetsHydraPositionsDetails = ({
  symbol,
  amount,
  amountUSD,
  shares,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row" }}>
      <div sx={{ m: "auto", flex: "column" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <div
            sx={{ mr: 8 }}
            css={css`
              &,
              svg {
                width: 16px;
                height: 16px;
              }
            `}
          >
            {getAssetLogo(symbol)}
          </div>
          <Text fs={12} lh={14} fw={500} color="basic300">
            {t("wallet.assets.hydraPositions.details.amount")}
          </Text>
        </div>
        <Text fs={14} lh={18} fw={500} color="white" sx={{ mt: 8 }}>
          {t("value", { value: amount, numberSuffix: ` ${symbol ?? "N/A"}` })}
        </Text>
        <Text
          fs={12}
          lh={16}
          fw={500}
          sx={{ mt: 2 }}
          css={{ color: `rgba(${theme.rgbColors.whiteish500} ,0.6)` }}
        >
          {t("value.usd", { amount: amountUSD })}
        </Text>
      </div>
      <div
        css={{
          width: 1,
          background: `rgba(${theme.rgbColors.white}, 0.06)`,
        }}
      />
      <div sx={{ m: "auto" }}>
        <Text fs={12} lh={14} fw={500} color="basic300">
          {t("wallet.assets.hydraPositions.details.shares")}
        </Text>
        <Text fs={14} lh={18} fw={500} color="white" sx={{ mt: 8 }}>
          {t("value", { value: shares })}
        </Text>
      </div>
    </div>
  )
}
