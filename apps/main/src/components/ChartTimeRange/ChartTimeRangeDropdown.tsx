import { Select } from "@galacticcouncil/ui/components"

export type ChartTimeRangeOptionType<TKey extends string> = {
  readonly key: TKey
  readonly label: string
}

type Props<
  TKey extends string,
  TOption extends ChartTimeRangeOptionType<TKey> | TKey,
> = {
  readonly options: ReadonlyArray<TOption>
  readonly selectedOption: TKey
  readonly onSelect: (option: TKey) => void
  readonly disabled?: boolean
}

export const ChartTimeRangeDropdown = <
  TKey extends string,
  TOption extends ChartTimeRangeOptionType<TKey> | TKey,
>({
  options,
  selectedOption,
  onSelect,
  disabled,
}: Props<TKey, TOption>) => {
  return (
    <Select
      disabled={disabled}
      value={selectedOption}
      onValueChange={(key) => {
        onSelect(key as TKey)
      }}
      items={options.map((option) => {
        const isKeyOption = typeof option === "string"
        const key = isKeyOption ? option : option.key

        return {
          key: key,
          label: isKeyOption ? option : option.label,
        }
      })}
    />
  )
}
