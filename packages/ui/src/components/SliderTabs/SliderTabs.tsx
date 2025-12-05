import { Button } from "@/components/Button"
import { SSliderTabs } from "@/components/SliderTabs/SliderTabs.styled"

type SliderTabsOptionKey = string | number

export type SliderTabsOption<TKey extends SliderTabsOptionKey> = {
  readonly id: TKey
  readonly label: string
  readonly icon?: React.ReactNode
}

type SliderTabsProps<TKey extends SliderTabsOptionKey> = {
  readonly options: ReadonlyArray<SliderTabsOption<TKey>>
  readonly selected?: NoInfer<TKey>
  readonly onSelect: (option: SliderTabsOption<NoInfer<TKey>>) => void
  readonly disabled?: boolean
  readonly className?: string
}

export const SliderTabs = <TKey extends SliderTabsOptionKey>({
  options,
  selected,
  onSelect,
  disabled,
  className,
}: SliderTabsProps<TKey>) => {
  return (
    <SSliderTabs className={className}>
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
            {option.icon}
            {option.label}
          </Button>
        )
      })}
    </SSliderTabs>
  )
}
