import styled from "@emotion/styled"

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
