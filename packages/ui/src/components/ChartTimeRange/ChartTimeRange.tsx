import { FC } from "react"

import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"

export type ChartTimeRangeProps = {
  readonly value: string
  readonly items: ReadonlyArray<string>
  readonly onValueChange: (value: string) => void
  readonly disabled?: boolean
  readonly className?: string
}

export const ChartTimeRange: FC<ChartTimeRangeProps> = ({
  value,
  items,
  onValueChange,
  disabled,
  className,
}) => {
  return (
    <Flex gap="quart" align="center" className={className}>
      {items.map((item) => (
        <Button
          key={item}
          size="small"
          variant={value === item ? "secondary" : "restSubtle"}
          outline={value !== item}
          onClick={() => onValueChange(item)}
          disabled={disabled}
          sx={{ borderRadius: "pill", px: "quart", maxHeight: 30 }}
        >
          <Text fs="p5" fw={500}>
            {item}
          </Text>
        </Button>
      ))}
    </Flex>
  )
}
