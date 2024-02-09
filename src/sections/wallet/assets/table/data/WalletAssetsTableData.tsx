import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { theme } from "theme"

export const WalletAssetsTableBalance = (props: {
  balance: BN
  balanceDisplay: BN
}) => {
  const { t } = useTranslation()

  const usdValue = props.balanceDisplay || "-"

  return (
    <div
      sx={{
        flex: "column",
        align: ["end", "start"],
        gap: 2,
        width: "fit-content",
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Text fs={14} lh={16} fw={500} color="white">
        {t("value.token", { value: props.balance })}
      </Text>

      <DollarAssetValue
        value={usdValue}
        wrapper={(children) => (
          <Text
            fs={13}
            lh={13}
            fw={500}
            css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.61)` }}
          >
            {children}
          </Text>
        )}
      >
        <DisplayValue value={usdValue} />
      </DollarAssetValue>
    </div>
  )
}
