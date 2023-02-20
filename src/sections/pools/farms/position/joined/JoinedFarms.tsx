import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SSeparator } from "../FarmingPosition.styled"
import { ReactElement } from "react"
import { BN_1 } from "utils/constants"
import { Icon } from "components/Icon/Icon"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssetMeta } from "api/assetMeta"

export const DepositedYieldFarm = ({ id }: { id: string }) => {
  const { t } = useTranslation()
  const { data: assetMeta } = useAssetMeta(id)

  if (!assetMeta) return null

  return (
    <div sx={{ flex: "row", align: "center", gap: 6 }}>
      <Icon size={20} icon={getAssetLogo(assetMeta.symbol)} />
      <Text>{assetMeta.symbol}</Text>
      <Text color="brightBlue200">
        {t("value.APR", {
          apr: BN_1,
        })}
      </Text>
    </div>
  )
}

export const JoinedFarms = ({ farms = ["", ""] }) => {
  const { t } = useTranslation()

  const assetAprs = farms.reduce((acc, apr, i) => {
    const isLastElement = i + 1 === farms.length

    acc.push(<DepositedYieldFarm key={i} id={"0"} />)

    if (!isLastElement)
      acc.push(
        <SSeparator key={i} sx={{ height: 35 }} orientation="vertical" />,
      )

    return acc
  }, [] as ReactElement[])

  return (
    <div sx={{ flex: "column", gap: 6 }}>
      <Text color="basic500" fs={14} lh={16} fw={400}>
        {t("farms.positions.labels.joinedFarms.title")}
      </Text>
      <div sx={{ flex: "row", gap: 35 }}>{assetAprs}</div>
    </div>
  )
}
