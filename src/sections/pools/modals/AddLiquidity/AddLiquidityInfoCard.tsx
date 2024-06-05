import { Text } from "components/Typography/Text/Text"
import InfoIcon from "assets/icons/LPInfoIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { SCardContainer, SLink } from "./AddLiquidity.styled"
import { useTranslation } from "react-i18next"
import { DOC_LINK } from "utils/constants"

export const PoolAddLiquidityInformationCard = () => {
  const { t } = useTranslation()

  return (
    <SCardContainer>
      <Icon size={24} icon={<InfoIcon />} />
      <div sx={{ flex: "column", gap: 8 }}>
        <Text fs={13} lh={16}>
          {t("liquidity.add.modal.information.text")}
        </Text>
        <SLink href={`${DOC_LINK}/howto_lp`} target="_blank">
          {t("liquidity.add.modal.information.linkText")}
        </SLink>
      </div>
    </SCardContainer>
  )
}
