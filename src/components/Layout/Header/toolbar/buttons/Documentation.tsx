import QuestionmarkIcon from "assets/icons/QuestionmarkIcon.svg?react"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import { useTranslation } from "react-i18next"

export type DocumentationProps = {}

export const Documentation: React.FC<DocumentationProps> = () => {
  const { t } = useTranslation()
  return (
    <InfoTooltip text={t("header.documentation.tooltip")} type="black" asChild>
      <a href="https://docs.hydradx.io/" target="blank" rel="noreferrer">
        <SToolbarButton as="span">
          <SToolbarIcon
            as={QuestionmarkIcon}
            aria-label={t("header.documentation.tooltip")}
          />
        </SToolbarButton>
      </a>
    </InfoTooltip>
  )
}
