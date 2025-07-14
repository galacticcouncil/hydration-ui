import { Box, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"

type Props = {
  readonly isSelected: boolean
  readonly children: string
  readonly onClick: () => void
}

export const TradeChartIntervalOption: FC<Props> = ({
  children,
  isSelected,
  onClick,
}) => {
  return (
    <Box
      sx={{
        cursor: "pointer",
        "&:hover": {
          bg: getToken("buttons.primary.low.hover"),
        },
      }}
      role="button"
      py={2}
      px={6}
      onClick={onClick}
      bg={isSelected ? getToken("buttons.primary.low.rest") : "transparent"}
      borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
    >
      <Text
        fs="p6"
        lh={1.4}
        color={
          isSelected
            ? getToken("buttons.primary.low.onButton")
            : getToken("text.medium")
        }
      >
        {children}
      </Text>
    </Box>
  )
}
