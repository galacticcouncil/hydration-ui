import { Button } from "@/components/Button"
import { SSliderTabs } from "@/components/SliderTabs/SliderTabs.styled"

export type SliderTabsOption<T> = {
  readonly id: string
  readonly label: string
  readonly value: T
}

type SliderTabsProps<T> = {
  readonly options: ReadonlyArray<SliderTabsOption<T>>
  readonly selected?: string
  readonly onSelect: (option: SliderTabsOption<T>) => void
}

export const SliderTabs = <T,>({
  options,
  selected,
  onSelect,
}: SliderTabsProps<T>) => {
  return (
    <SSliderTabs>
      {options.map((option) => {
        const isSelected = selected === option.id

        return (
          <Button
            key={option.id}
            aria-label={option.label}
            variant={isSelected ? "sliderTabActive" : "sliderTabInactive"}
            onClick={() => onSelect(option)}
          >
            {option.label}
          </Button>
        )
      })}
    </SSliderTabs>
  )
}
