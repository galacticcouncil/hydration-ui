import { Inner, Outer } from "./CheckBox.styled"

type Props = {
  selected?: boolean
}

export const CheckBox = ({ selected }: Props) => (
  <Outer selected={selected}>{selected && <Inner />}</Outer>
)
