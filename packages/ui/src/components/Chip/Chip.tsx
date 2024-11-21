import { forwardRef } from "react"

import { SChip } from "@/components/Chip/Chip.styled"

export const Chip = forwardRef<HTMLSpanElement>((props) => <SChip {...props} />)

Chip.displayName = "Chip"
