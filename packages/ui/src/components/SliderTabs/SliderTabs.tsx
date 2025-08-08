import { Button } from "@/components/Button"
import { SSliderTabs } from "@/components/SliderTabs/SliderTabs.styled"

type SliderTabsOptionKey = string | number

export type SliderTabsOption<TKey extends SliderTabsOptionKey> = {
  readonly id: TKey
  readonly label: string
}

type SliderTabsProps<TKey extends SliderTabsOptionKey> = {
  readonly options: ReadonlyArray<SliderTabsOption<TKey>>
  readonly selected?: NoInfer<TKey>
  readonly onSelect: (option: SliderTabsOption<NoInfer<TKey>>) => void
  readonly disabled?: boolean
}

export const SliderTabs = <TKey extends SliderTabsOptionKey>({
  options,
  selected,
  onSelect,
  disabled,
}: SliderTabsProps<TKey>) => {
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
            disabled={disabled}
            sx={{ flex: 1 }}
          >
            {option.label}
          </Button>
        )
      })}
    </SSliderTabs>
  )
}
