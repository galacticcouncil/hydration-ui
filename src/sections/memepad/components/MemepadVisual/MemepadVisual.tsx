import React from "react"
import { SBottleCaps, SContainer } from "./MemepadVisual.styled"

export type MemepadVisualProps = {
  className?: string
}

export const MemepadVisual: React.FC<MemepadVisualProps> = ({ className }) => {
  return (
    <SContainer className={className}>
      <SBottleCaps />
    </SContainer>
  )
}
