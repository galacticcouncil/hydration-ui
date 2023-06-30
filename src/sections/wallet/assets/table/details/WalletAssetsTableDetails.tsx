import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

type Props = {
  lockedMax: BN
  lockedMaxDisplay: BN
  reserved: BN
  reservedDisplay: BN
}

export const WalletAssetsTableDetails = ({
  lockedMax,
  lockedMaxDisplay,
  reserved,
  reservedDisplay,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row" }}>
      <div sx={{ m: "auto" }}>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: reserved })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={reservedDisplay} />
        </Text>
      </div>
      <Separator orientation="vertical" color="white" opacity={0.12} />
      <div sx={{ m: "auto" }}>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.locked")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedMax })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedMaxDisplay} />
        </Text>
      </div>
    </div>
  )
}
