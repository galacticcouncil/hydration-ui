import { Inner, Outer } from './CheckBox.styled'

type Props = {
  selected?: boolean;
  onSelect: () => void;
}

export const CheckBox = ({ selected, onSelect }: Props) => (
  <Outer selected={selected} onClick={onSelect}>
    {selected && <Inner />}
  </Outer>
)

