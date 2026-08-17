import { Select, SelectSize } from "@galacticcouncil/ui/components"

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
  readonly size?: SelectSize
}

export const ChartTimeRangeDropdown = <
  TKey extends string,
  TOption extends ChartTimeRangeOptionType<TKey> | TKey,
>({
  options,
  selectedOption,
  onSelect,
  disabled,
  size,
}: Props<TKey, TOption>) => {
  return (
    <Select
      size={size}
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
