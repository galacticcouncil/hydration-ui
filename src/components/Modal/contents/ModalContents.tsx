import { AnimatePresence } from "framer-motion"
import { ReactNode, useState } from "react"
import { useMeasure } from "react-use"
import {
  ModalHeaderButton,
  ModalHeaderTitle,
  ModalHeaderVariant,
} from "components/Modal/header/ModalHeader"
import { SContainer, SContent } from "./ModalContents.styled"

export type ModalContentProps = {
  title?: string
  headerVariant?: ModalHeaderVariant
  noPadding?: boolean
  hideBack?: boolean
}

type Props = {
  page?: number
  direction?: number
  onClose?: () => void
  onBack?: () => void
  forceBack?: boolean
  disableAnimation?: boolean
  disableHeightAnimation?: boolean
  className?: string
  contents: ({ content: ReactNode } & ModalContentProps)[]
}

export const ModalContents = ({
  page = 0,
  direction = 0,
  onClose,
  onBack,
  forceBack,
  disableAnimation,
  disableHeightAnimation,
  className,
  contents,
}: Props) => {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const [animating, setAnimating] = useState(false)

  const canBack =
    !contents[page].hideBack && !!onBack && (forceBack || page > 0)

  const title = contents[page].title
  const headerVariant = contents[page].headerVariant || "gradient"
  const noPadding = contents[page].noPadding

  const height = disableHeightAnimation
    ? "auto"
    : `calc(${size.height}px - var(--modal-header-height))`

  return (
    <SContainer ref={ref} className={className} animating={animating}>
      <Wrapper
        direction={direction}
        height={height}
        disableAnimation={disableAnimation}
      >
        <ModalHeaderTitle
          key={`title-${page}`}
          title={title}
          variant={headerVariant}
          canBack={canBack}
          page={page}
          direction={direction}
          disableAnimation={disableAnimation}
        />
        <SContent
          key={`content-${page}`}
          custom={{ direction, height }}
          noPadding={noPadding}
          onAnimationStart={() => setAnimating(true)}
          onAnimationComplete={() => setAnimating(false)}
          {...(!disableAnimation ? motionProps : {})}
        >
          {contents[page].content}
        </SContent>
        {canBack && (
          <ModalHeaderButton
            key={`back-${page}`}
            variant="back"
            headerVariant={headerVariant}
            onClick={onBack}
            direction={direction}
            disableAnimation={disableAnimation}
          />
        )}
      </Wrapper>
      {onClose && (
        <ModalHeaderButton
          variant="close"
          onClick={onClose}
          headerVariant={headerVariant}
          disableAnimation
        />
      )}
    </SContainer>
  )
}

const Wrapper = ({
  disableAnimation,
  direction,
  height,
  children,
}: {
  disableAnimation?: boolean
  direction: number
  height: string
  children: ReactNode
}) => {
  return disableAnimation ? (
    <>{children}</>
  ) : (
    <AnimatePresence
      mode="popLayout"
      initial={false}
      custom={{ direction, height }}
    >
      {children}
    </AnimatePresence>
  )
}

type VariantProps = { direction: number; height: string }

const variants = {
  enter: ({ direction, height }: VariantProps) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.25,
    height: "auto",
  }),
  center: {
    x: 0,
    opacity: 1,
    height: "auto",
  },
  exit: ({ direction }: VariantProps) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0.25,
    height: 0,
  }),
}

const motionProps = {
  initial: "enter",
  animate: "center",
  exit: "exit",
  transition: { duration: 0.3, ease: "easeInOut" },
  variants,
}
