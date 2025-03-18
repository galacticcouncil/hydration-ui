import { forwardRef } from "react"

import { BoxProps } from "@/components"
import { SChip, SChipProps } from "@/components/Chip/Chip.styled"

export type ChipOwnProps = {
  variant?: "primary" | "secondary"
}

export type ChipProps = BoxProps & SChipProps

export const Chip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
  <SChip ref={ref} {...props} />
))

Chip.displayName = "Chip"
