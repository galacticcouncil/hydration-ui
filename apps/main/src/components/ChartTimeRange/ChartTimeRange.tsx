import { Flex } from "@galacticcouncil/ui/components"

import { ChartTimeRangeOption } from "@/components/ChartTimeRange/ChartTimeRangeOption"

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
  readonly className?: string
  readonly onSelect: (option: TOption) => void
}

export const ChartTimeRange = <
  TKey extends string,
  TOption extends ChartTimeRangeOptionType<TKey> | TKey,
>({
  options,
  selectedOption,
  className,
  onSelect,
}: Props<TKey, TOption>) => {
  return (
    <Flex py="xs" px="base" align="center" gap="xs" className={className}>
      {options.map((option) => {
        const isKeyOption = typeof option === "string"
        const key = isKeyOption ? option : option.key

        return (
          <ChartTimeRangeOption
            key={key}
            isSelected={key === selectedOption}
            onClick={() => onSelect(option)}
          >
            {isKeyOption ? option : option.label}
          </ChartTimeRangeOption>
        )
      })}
    </Flex>
  )
}
