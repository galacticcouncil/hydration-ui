import { SChip } from "./Chip.styled"

export type ChipProps = {
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
} & React.HTMLAttributes<HTMLButtonElement>

export const Chip: React.FC<ChipProps> = (props) => {
  return <SChip {...props} />
}
