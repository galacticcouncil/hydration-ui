import { Flex } from "@galacticcouncil/ui/components"

import { TradeChartIntervalOption } from "@/modules/trade/swap/components/TradeChart/TradeChartIntervalOption"

export type TradeChartIntervalOptionType<TKey extends string> = {
  readonly key: TKey
  readonly label: string
}

type Props<
  TKey extends string,
  TOption extends TradeChartIntervalOptionType<TKey>,
> = {
  readonly options: ReadonlyArray<TOption>
  readonly selectedOption: TKey
  readonly onSelect: (option: TOption) => void
}

export const TradeChartInterval = <
  TKey extends string,
  TOption extends TradeChartIntervalOptionType<TKey>,
>({
  options,
  selectedOption,
  onSelect,
}: Props<TKey, TOption>) => {
  return (
    <Flex py={2} px={8} align="center" gap={2}>
      {options.map((option) => (
        <TradeChartIntervalOption
          key={option.key}
          isSelected={option.key === selectedOption}
          onClick={() => onSelect(option)}
        >
          {option.label}
        </TradeChartIntervalOption>
      ))}
    </Flex>
  )
}
