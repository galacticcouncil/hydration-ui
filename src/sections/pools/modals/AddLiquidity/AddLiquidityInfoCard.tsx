import { Text } from "components/Typography/Text/Text"
import { ReactComponent as InfoIcon } from "assets/icons/LPInfoIcon.svg"
import { Icon } from "components/Icon/Icon"
import { SCardContainer, SLink } from "./AddLiquidity.styled"
import { useTranslation } from "react-i18next"

export const PoolAddLiquidityInformationCard = () => {
  const { t } = useTranslation()

  return (
    <SCardContainer>
      <Icon size={24} icon={<InfoIcon />} />
      <div>
        <Text fs={13} lh={16} css={{}}>
          {t("liquidity.add.modal.information.text")}
        </Text>
        <SLink href="https://docs.hydradx.io/howto_lp/" target="_blank">
          {t("liquidity.add.modal.information.linkText")}
        </SLink>
      </div>
    </SCardContainer>
  )
}
