import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { SHideShow } from "./HideShow.styled"

type Props = {
  readonly isOpen: boolean
  readonly onToggle?: () => void
}

export const HideShow: FC<Props> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation()

  return (
    <SHideShow isOpen={isOpen} onClick={onToggle}>
      <Text color="darkBlue300" fs={12} fw={500}>
        {isOpen ? t("hide") : t("show")}
      </Text>
      <ChevronDown />
    </SHideShow>
  )
}
