import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { Separator } from "components/Separator/Separator"

type Props = {
  lockedMax: BN
  lockedMaxUSD: BN
  // lockedVesting: BN
  // lockedVestingUSD: BN
  // lockedDemocracy: BN
  // lockedDemocracyUSD: BN
  reserved: BN
  reservedUSD: BN
}

export const WalletAssetsTableDetails = ({
  lockedMax,
  lockedMaxUSD,
  // lockedVesting,
  // lockedVestingUSD,
  // lockedDemocracy,
  // lockedDemocracyUSD,
  reserved,
  reservedUSD,
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
          {t("value.usd", { amount: reservedUSD })}
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
          {t("value.usd", { amount: lockedMaxUSD })}
        </Text>
      </div>
      {/*<div sx={{ m: "auto" }}>*/}
      {/*  <Text fs={14} lh={14} fw={500} color="basic300">*/}
      {/*    {t("wallet.assets.table.details.lockedDemocracy")}*/}
      {/*  </Text>*/}
      {/*  <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>*/}
      {/*    {t("value.token", { value: lockedDemocracy })}*/}
      {/*  </Text>*/}
      {/*  <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>*/}
      {/*    {t("value.usd", { amount: lockedDemocracyUSD })}*/}
      {/*  </Text>*/}
      {/*</div>*/}
      {/*<Separator orientation="vertical" color="white" opacity={0.12} />*/}
      {/*<div sx={{ m: "auto" }}>*/}
      {/*  <Text fs={14} lh={14} fw={500} color="basic300">*/}
      {/*    {t("wallet.assets.table.details.lockedVesting")}*/}
      {/*  </Text>*/}
      {/*  <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>*/}
      {/*    {t("value.token", { value: lockedVesting })}*/}
      {/*  </Text>*/}
      {/*  <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>*/}
      {/*    {t("value.usd", { amount: lockedVestingUSD })}*/}
      {/*  </Text>*/}
      {/*</div>*/}
    </div>
  )
}
