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

  return (
    <div sx={{ flex: "column", align: ["end", "start"], gap: 2 }}>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value.token", { value: props.balance })}
      </Text>

      <DollarAssetValue
        value={props.balanceDisplay}
        wrapper={(children) => (
          <Text
            fs={[11, 13]}
            lh={[14, 16]}
            fw={500}
            css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.61)` }}
          >
            {children}
          </Text>
        )}
      >
        <DisplayValue value={props.balanceDisplay} />
      </DollarAssetValue>
    </div>
  )
}
