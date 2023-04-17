import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"
import { useMeasure } from "react-use"
import { ModalHeaderButton, ModalHeaderTitle } from "../header/ModalHeader"

type Props = {
  page: number
  direction: number
  onBack?: () => void
  onClose?: () => void
  contents: { title?: string; content: ReactNode }[]
}

export const ModalContents = ({
  page,
  direction,
  onBack,
  onClose,
  contents,
}: Props) => {
  const [ref, { height }] = useMeasure<HTMLDivElement>()

  const canBack = !!onBack && page > 0

  return (
    <div ref={ref}>
      <AnimatePresence
        mode="popLayout"
        initial={false}
        custom={{ direction, height }}
      >
        <ModalHeaderTitle
          key={`title-${page}`}
          title={contents[page].title}
          centered={canBack}
          page={page}
          direction={direction}
        />
        <motion.div
          key={`content-${page}`}
          custom={{ direction, height }}
          {...motionProps}
        >
          {contents[page].content}
        </motion.div>
        {canBack && (
          <ModalHeaderButton
            key="back"
            variant="back"
            onClick={onBack}
            direction={direction}
          />
        )}
        {onClose && (
          <ModalHeaderButton
            key="close"
            variant="close"
            onClick={onClose}
            direction={direction}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

type VariantProps = { direction: number; height: number }

const variants = {
  enter: ({ direction, height }: VariantProps) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    height,
  }),
  center: {
    x: 0,
    opacity: 1,
    height: "auto",
  },
  exit: ({ direction }: VariantProps) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
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
