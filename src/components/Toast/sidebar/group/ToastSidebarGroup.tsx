import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useToggle } from "react-use"
import {
  SContainer,
  SContent,
  SHeader,
  SHide,
  SToggle,
} from "./ToastSidebarGroup.styled"

type Props = { title: string; children: ReactNode }

export const ToastSidebarGroup = ({ title, children }: Props) => {
  const { t } = useTranslation()
  const [isOpen, toggle] = useToggle(true)

  return (
    <div>
      <SToggle onClick={toggle} isOpen={isOpen}>
        <SHeader>{title}</SHeader>
        <SHide>
          <Text color="darkBlue300" fs={12} fw={500}>
            {t("hide")}
          </Text>
          <ChevronDown />
        </SHide>
      </SToggle>
      <SContainer isOpen={isOpen}>
        <SContent>
          <div sx={{ p: [8, 20] }}>{children}</div>
        </SContent>
      </SContainer>
    </div>
  )
}
