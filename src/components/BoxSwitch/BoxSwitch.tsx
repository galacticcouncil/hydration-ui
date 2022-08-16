import {
  StyledButton,
  StyledButtonBackground,
  StyledSwitch,
  StyledText,
} from "components/BoxSwitch/BoxSwitch.styled"

type Props = {
  options: { label: string; value: number }[]
  selected?: number
  onSelect: (value: number) => void
}

export const BoxSwitch = ({ options, selected, onSelect }: Props) => {
  const getActiveIndex = () => {
    if (selected === undefined) return -1
    const active = options.find((o) => o.value === selected)
    return options.indexOf(active ?? options[0])
  }

  return (
    <StyledSwitch>
      {options.map((option, i) => (
        <StyledButton
          key={i}
          onClick={() => onSelect(option.value)}
          isActive={selected === option.value}
        >
          <StyledText
            fw={700}
            color={selected === option.value ? "black" : "white"}
          >
            {option.label}
          </StyledText>
        </StyledButton>
      ))}
      <StyledButtonBackground index={getActiveIndex()} />
    </StyledSwitch>
  )
}
