import {
  SButton,
  SButtonBackground,
  SSwitch,
  SText,
} from "components/BoxSwitch/BoxSwitch.styled"

export type BoxSwitchOption = {
  label: string
  value: number
}

type Props = {
  options: ReadonlyArray<BoxSwitchOption>
  selected?: number
  onSelect: (value: number) => void
  disabled?: boolean
  className?: string
}

export const BoxSwitch = ({
  options,
  selected,
  onSelect,
  disabled,
  className,
}: Props) => {
  const getActiveIndex = () => {
    if (selected === undefined) return -1
    return options.reduce(
      (memo, i, idx) => (selected >= i.value ? Math.max(memo, idx) : memo),
      -1,
    )
  }

  const activeIndex = getActiveIndex()

  return (
    <SSwitch className={className}>
      {options.map((option, i) => (
        <SButton
          key={i}
          onClick={() => (disabled ? null : onSelect(option.value))}
          isActive={activeIndex === i}
          type="button"
          disabled={disabled}
        >
          <SText
            fs={[14, 15]}
            fw={500}
            isActive={activeIndex === i}
            font="GeistMono"
          >
            {option.label}
          </SText>
        </SButton>
      ))}
      <SButtonBackground index={activeIndex} />
    </SSwitch>
  )
}
