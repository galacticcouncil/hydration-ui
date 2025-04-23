import { Button } from "../Button"
import { SSliderTabs } from "./SliderTabs.styled"

type TOption = {
  id: string
  label: string
}

type SliderTabsProps = {
  options: TOption[]
  selected?: string
  onSelect: (option: TOption) => void
}

export const SliderTabs = ({
  options,
  selected,
  onSelect,
}: SliderTabsProps) => (
  <SSliderTabs>
    {options.map((option) => (
      <Button
        key={option.id}
        aria-label={option.label}
        variant={selected === option.id ? "secondary" : "tertiary"}
        onClick={() => onSelect(option)}
      >
        {option.label}
      </Button>
    ))}
  </SSliderTabs>
)
