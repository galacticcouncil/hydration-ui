import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { ReactElement } from "react"
import { SSeparator } from "../FarmingPosition.styled"

const RedepositFarm = () => {
  return (
    <div sx={{ flex: "row", align: "center", gap: 4 }}>
      <Icon icon={getAssetLogo("DAI")} />
    </div>
  )
}

export const RedepositFarms = ({ farms = ["", ""] }) => {
  const { t } = useTranslation()

  const farmComponents = farms.reduce((acc, apr, i) => {
    const isLastElement = i + 1 === farms.length

    acc.push(<RedepositFarm key={i} />)

    if (!isLastElement)
      acc.push(
        <SSeparator key={i} sx={{ height: 35 }} orientation="vertical" />,
      )

    return acc
  }, [] as ReactElement[])

  return (
    <SContainer>
      <Text fs={13} fw={600} color="brightBlue300" tTransform="uppercase">
        <Trans t={t} i18nKey="farms.positions.redeposit.openFarms" />
      </Text>
      {farmComponents}
      <SJoinButton>
        <Text fs={13} color="basic900" tTransform="uppercase">
          {t("farms.positions.join.button.label")}
        </Text>
      </SJoinButton>
    </SContainer>
  )
}
