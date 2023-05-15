import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssetMeta } from "api/assetMeta"
import { Icon } from "components/Icon/Icon"

type Props = {
  assetId: string
  symbol: string
  amount: BN
  amountUSD: BN
  shares: BN
}

export const WalletAssetsHydraPositionsDetails = ({
  assetId,
  symbol,
  amount,
  amountUSD,
  shares,
}: Props) => {
  const { t } = useTranslation()

  const meta = useAssetMeta(assetId)

  return (
    <div sx={{ flex: "row" }}>
      <div sx={{ m: "auto", flex: "column" }}>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Icon size={16} icon={getAssetLogo(symbol)} />
          <Text fs={12} lh={14} fw={500} color="basic300">
            {t("wallet.assets.hydraPositions.details.amount")}
          </Text>
        </div>
        <Text fs={14} lh={18} fw={500} color="white" sx={{ mt: 8 }}>
          {t("value", {
            value: amount,
            fixedPointScale: meta.data?.decimals.toString() ?? 12,
            numberSuffix: ` ${symbol ?? "N/A"}`,
            type: "token",
          })}
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
          {t("value", {
            value: shares,
            fixedPointScale: meta.data?.decimals.toString() ?? 12,
            type: "token",
          })}
        </Text>
      </div>
    </div>
  )
}
