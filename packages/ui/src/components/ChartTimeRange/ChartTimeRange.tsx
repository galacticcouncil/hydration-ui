import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"

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
  readonly disabled?: boolean
  readonly className?: string
  readonly onSelect: (option: TOption) => void
}

export type ChartTimeRangeProps = {
  readonly value: string
  readonly items: ReadonlyArray<string>
  readonly onValueChange: (value: string) => void
  readonly disabled?: boolean
  readonly className?: string
}

export const ChartTimeRange = <
  TKey extends string,
  TOption extends ChartTimeRangeOptionType<TKey> | TKey,
>({
  selectedOption,
  options,
  onSelect,
  disabled,
  className,
}: Props<TKey, TOption>) => {
  return (
    <Flex gap="quart" align="center" className={className}>
      {options.map((option) => {
        const isKeyOption = typeof option === "string"
        const key = isKeyOption ? option : option.key

        return (
          <Button
            key={key}
            size="small"
            variant={key === selectedOption ? "secondary" : "restSubtle"}
            outline={key !== selectedOption}
            onClick={() => onSelect(option)}
            disabled={disabled}
            sx={{ borderRadius: "pill", px: "quart", maxHeight: 30 }}
          >
            <Text fs="p5" fw={500}>
              {isKeyOption ? option : option.label}
            </Text>
          </Button>
        )
      })}
    </Flex>
  )
}
