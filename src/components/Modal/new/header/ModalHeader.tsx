import { ReactComponent as ChevronIcon } from "assets/icons/ChevronRight.svg"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { SButton, SButtonContainer, SContainer } from "./ModalHeader.styled"

type TitleProps = {
  title?: string
  direction: number
  page: number
  centered: boolean
}

export const ModalHeaderTitle = ({
  title,
  direction,
  page,
  centered,
}: TitleProps) => {
  return (
    <SContainer
      key={`title-${page}`}
      centered={centered}
      custom={{ direction }}
      {...motionProps}
    >
      <Text>{title}</Text>
    </SContainer>
  )
}

type ButtonProps = {
  variant: "back" | "close"
  onClick: () => void
  direction: number
}

export const ModalHeaderButton = ({
  variant,
  onClick,
  direction,
}: ButtonProps) => {
  const position = variant === "back" ? "left" : "right"
  const icon =
    variant === "back" ? (
      <ChevronIcon css={{ transform: "rotate(180deg)" }} />
    ) : (
      <CrossIcon />
    )

  return (
    <SButtonContainer
      key={variant}
      position={position}
      custom={{ direction }}
      {...motionProps}
    >
      <SButton onClick={onClick} icon={icon} />
    </SButtonContainer>
  )
}

const variants = {
  enter: ({ direction }: { direction: number }) => ({
    x: direction > 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: ({ direction }: { direction: number }) => ({
    x: direction < 0 ? 64 : -64,
    opacity: 0,
  }),
}

const motionProps = {
  initial: "enter",
  animate: "center",
  exit: "exit",
  transition: { duration: 0.3, ease: "easeInOut" },
  variants,
}
