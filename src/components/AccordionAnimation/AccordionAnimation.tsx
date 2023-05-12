import { ReactNode } from "react"
import { Expander, ExpanderContent } from "./AccordionAnimation.styled"

type AccordionAniamtionProps = {
  isExpanded: boolean
  children: ReactNode
}

export const AccordionAnimation = ({
  children,
  isExpanded,
}: AccordionAniamtionProps) => {
  return (
    <Expander expanded={isExpanded}>
      <ExpanderContent expanded={isExpanded}>{children}</ExpanderContent>
    </Expander>
  )
}
