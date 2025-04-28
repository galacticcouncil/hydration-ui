import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useToggle } from "react-use"
import { SContainer, SSide, SToggle } from "./ToastSidebarGroup.styled"
import { HideShow } from "components/HideShow"

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
          <HideShow isOpen={isOpen} />
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
