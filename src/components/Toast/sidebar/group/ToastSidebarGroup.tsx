import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useToggle } from "react-use"
import { SContainer, SHide, SSide, SToggle } from "./ToastSidebarGroup.styled"

type Props = {
  title: string
  info?: string
  children: ReactNode
  open?: boolean
}

export const ToastSidebarGroup = ({
  title,
  info,
  children,
  open = true,
}: Props) => {
  const { t } = useTranslation()
  const [isOpen, toggle] = useToggle(open)

  return (
    <div>
      <SToggle onClick={toggle} isOpen={isOpen}>
        <Text fs={14} fw={400} color="basic400">
          {title}
        </Text>
        <SSide>
          {info && (
            <Text fs={12} fw={500} color="brightBlue300">
              {info}
            </Text>
          )}
          <SHide>
            <Text color="darkBlue300" fs={12} fw={500}>
              {isOpen ? t("hide") : t("show")}
            </Text>
            <ChevronDown />
          </SHide>
        </SSide>
      </SToggle>
      <SContainer isOpen={isOpen}>
        <div css={{ overflow: "hidden" }}>
          <div sx={{ p: [8, 20] }}>{children}</div>
        </div>
      </SContainer>
    </div>
  )
}
