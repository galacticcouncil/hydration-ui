import {
  SButton,
  SButtonBackground,
  SSwitch,
  SText,
} from "components/BoxSwitch/BoxSwitch.styled"

type Props = {
  options: { label: string; value: number }[]
  selected?: number
  onSelect: (value: number) => void
}

export const BoxSwitch = ({ options, selected, onSelect }: Props) => {
  const getActiveIndex = () => {
    if (selected === undefined) return -1
    return options.reduce(
      (memo, i, idx) => (selected >= i.value ? Math.max(memo, idx) : memo),
      -1,
    )
  }

  const activeIndex = getActiveIndex()

  return (
    <SSwitch>
      {options.map((option, i) => (
        <SButton
          key={i}
          onClick={() => onSelect(option.value)}
          isActive={activeIndex === i}
          type="button"
        >
          <SText isActive={activeIndex === i}>{option.label}</SText>
        </SButton>
      ))}
      <SButtonBackground index={activeIndex} />
    </SSwitch>
  )
}
