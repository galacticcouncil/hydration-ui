import { FC } from "react"

import { BoxProps } from "@/components"
import { SChip, SChipProps } from "@/components/Chip/Chip.styled"

export type ChipProps = BoxProps &
  SChipProps & {
    ref?: React.Ref<HTMLDivElement>
  }

export const Chip: FC<ChipProps> = (props) => <SChip {...props} />
