import { forwardRef } from "react"

import { SChip } from "@/components/Chip/Chip.styled"

export const Chip = forwardRef<HTMLSpanElement>((props, ref) => (
  <SChip ref={ref} {...props} />
))

Chip.displayName = "Chip"
