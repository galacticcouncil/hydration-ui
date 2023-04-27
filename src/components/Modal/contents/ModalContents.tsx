import { AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { useMeasure } from "react-use"
import {
  ModalHeaderButton,
  ModalHeaderTitle,
  ModalHeaderVariant,
} from "../header/ModalHeader"
import { SContainer, SContent } from "./ModalContents.styled"

export type ModalContentProps = {
  title?: string
  headerVariant?: ModalHeaderVariant
  noPadding?: boolean
}
type Props = {
  page?: number
  direction?: number
  onBack?: () => void
  onClose?: () => void
  contents: ({ content: ReactNode } & ModalContentProps)[]
}

export const ModalContents = ({
  page = 0,
  direction = 0,
  onBack,
  onClose,
  contents,
}: Props) => {
  const [ref, size] = useMeasure<HTMLDivElement>()

  const height = size.height
  const canBack = !!onBack && page > 0

  const title = contents[page].title
  const headerVariant = contents[page].headerVariant || "gradient"
  const noPadding = contents[page].noPadding

  return (
    <SContainer ref={ref}>
      <AnimatePresence
        mode="popLayout"
        initial={false}
        custom={{ direction, height }}
      >
        <ModalHeaderTitle
          key={`title-${page}`}
          title={title}
          variant={headerVariant}
          canBack={canBack}
          page={page}
          direction={direction}
        />
        <SContent
          key={`content-${page}`}
          custom={{ direction, height }}
          noPadding={noPadding}
          {...motionProps}
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
          />
        )}
      </AnimatePresence>
      {onClose && (
        <ModalHeaderButton
          variant="close"
          onClick={onClose}
          headerVariant={headerVariant}
        />
      )}
    </SContainer>
  )
}

type VariantProps = { direction: number; height: number }

const variants = {
  enter: ({ direction, height }: VariantProps) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.25,
    height,
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
