import { Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export type TimelineStopStatus = "active" | "future"

export interface TimelineStop {
  /** Top label, e.g. "Today" / "Next maturity" / "Est. receive". */
  label: string
  /** Sub-label, e.g. "Queue entered" / "~Day 30" / "≤ Day 62". */
  sublabel: string
  status: TimelineStopStatus
}

interface Props {
  stops: TimelineStop[]
}

const Dot = ({ status }: { status: TimelineStopStatus }) => (
  <Box
    sx={{
      width: 12,
      height: 12,
      borderRadius: "full",
      border: "2px solid",
      borderColor:
        status === "active" ? "accents.success.emphasis" : "details.separators",
      bg:
        status === "active" ? "accents.success.emphasis" : "surfaces.containers.high.primary",
      flexShrink: 0,
    }}
  />
)

/**
 * Three-stop horizontal timeline used inside the Withdraw modal's
 * "Redemption queue" method card (Figma 7526:35079).
 *
 * Renders a connector line behind the dots; each stop has a label on top
 * and sublabel below. Active stops use the success green; future stops are
 * muted-outline circles.
 */
export const WithdrawTimeline = ({ stops }: Props) => {
  return (
    <Box sx={{ position: "relative", py: "m" }}>
      {/* Connector line — sits behind the dots at row center. */}
      <Box
        sx={{
          position: "absolute",
          left: "5%",
          right: "5%",
          top: "calc(50% - 1px)",
          height: "2px",
          bg: "details.separators",
        }}
      />

      <Flex justify="space-between" align="center" sx={{ position: "relative" }}>
        {stops.map((stop, i) => (
          <Flex
            key={i}
            direction="column"
            align="center"
            gap={6}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Text
              fs="p6"
              fw={500}
              color={getToken("text.medium")}
              sx={{ textAlign: "center" }}
            >
              {stop.label}
            </Text>
            <Dot status={stop.status} />
            <Text
              fs="p6"
              color={
                stop.status === "active" ? "accents.success.emphasis" : "text.low"
              }
              sx={{ textAlign: "center" }}
            >
              {stop.sublabel}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
