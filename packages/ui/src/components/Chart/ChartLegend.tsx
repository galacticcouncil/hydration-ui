import { Box, Flex, Text } from "@/components"
import { getToken } from "@/utils"

import { SChartLegendButton } from "./ChartLegend.styled"

const INACTIVE_OPACITY = 0.3

export type ChartLegendProps = {
  color: string
  label: string
  borderColor?: string
  /** Makes the legend a toggle button; it fades out while `active` is false. */
  onClick?: () => void
  active?: boolean
}

export const ChartLegend = ({
  color,
  label,
  borderColor,
  onClick,
  active = true,
}: ChartLegendProps) => {
  const content = (
    <>
      <Box
        as="span"
        size="xs"
        borderRadius="base"
        bg={color}
        display="inline-block"
        sx={borderColor ? { border: `1px solid ${borderColor}` } : undefined}
      />
      <Text fs="p6" fw={500} color={getToken("text.medium")}>
        {label}
      </Text>
    </>
  )

  if (!onClick)
    return (
      <Flex align="center" gap="s">
        {content}
      </Flex>
    )

  return (
    <SChartLegendButton
      type="button"
      aria-pressed={active}
      onClick={onClick}
      sx={{ opacity: active ? 1 : INACTIVE_OPACITY }}
    >
      {content}
    </SChartLegendButton>
  )
}
