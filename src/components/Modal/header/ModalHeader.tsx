import { ReactComponent as ChevronIcon } from "assets/icons/ChevronRight.svg"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { forwardRef, useMemo } from "react"
import {
  SButton,
  SButtonContainer,
  SContainer,
  STitleGradient,
} from "./ModalHeader.styled"

type TitleProps = {
  title?: string
  variant?: ModalHeaderVariant
  direction: number
  page: number
  canBack: boolean
}

export const ModalHeaderTitle = forwardRef<HTMLDivElement, TitleProps>(
  ({ title, variant, direction, page, canBack }, ref) => {
    const content = useMemo(() => {
      if (!title) return null

      switch (variant) {
        case "simple":
          return <Text>{title}</Text>
        case "FontOver":
          return <Text font="FontOver">{title}</Text>
        case "gradient":
        default:
          return <STitleGradient>{title}</STitleGradient>
      }
    }, [title, variant])

    return (
      <SContainer
        key={`title-${page}`}
        ref={ref}
        variant={variant}
        centered={canBack}
        custom={{ direction }}
        {...motionProps}
      >
        {content}
      </SContainer>
    )
  },
)

type ButtonProps = {
  variant: "back" | "close"
  onClick: () => void
  direction?: number
  headerVariant?: ModalHeaderVariant
}

export const ModalHeaderButton = forwardRef<HTMLDivElement, ButtonProps>(
  ({ variant, onClick, direction, headerVariant }, ref) => {
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
        ref={ref}
        position={position}
        custom={{ direction }}
        {...(variant === "close" ? {} : motionProps)}
      >
        <SButton onClick={onClick} icon={icon} headerVariant={headerVariant} />
      </SButtonContainer>
    )
  },
)

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

export type ModalHeaderVariant = "gradient" | "FontOver" | "simple"
