import { Inner, Outer } from "./CheckBox.styled"

type Props = {
  selected?: boolean
  disabled?: boolean
}

export const CheckBox = ({ selected, disabled }: Props) => (
  <Outer selected={selected} disabled={disabled}>
    {selected && <Inner />}
  </Outer>
)
