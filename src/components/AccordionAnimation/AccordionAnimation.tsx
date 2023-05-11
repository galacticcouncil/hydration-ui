import styled from "@emotion/styled"
import { ReactNode } from "react"

export const Expander = styled.div<{ expanded: boolean }>`
  display: grid;
  grid-template-rows: ${(p) => (p.expanded ? "1fr" : "0fr")};
  overflow: hidden;
  transition: grid-template-rows 0.5s;
`

export const ExpanderContent = styled.div<{ expanded: boolean }>`
  min-height: 0;
  transition: visibility 0.5s;
  visibility: ${(p) => (p.expanded ? "visible" : "hidden")};
`

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
