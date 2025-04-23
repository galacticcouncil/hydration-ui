import QuestionmarkIcon from "assets/icons/QuestionmarkIcon.svg?react"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import { useTranslation } from "react-i18next"
import { DOC_LINK } from "utils/constants"

export type DocumentationProps = {}

export const Documentation: React.FC<DocumentationProps> = () => {
  const { t } = useTranslation()
  return (
    <InfoTooltip text={t("header.documentation.tooltip")} type="black" asChild>
      <a href={DOC_LINK} target="blank" rel="noreferrer">
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
