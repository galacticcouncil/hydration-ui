import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"

type CapsCircularStatusProps = {
  value: number
  tooltipContent: ReactNode
  onClick?: (open: boolean) => void
}

export const CapsCircularStatus = ({
  value,
  tooltipContent,
}: CapsCircularStatusProps) => {
  // If value is zero, don't show anything
  if (value === 0) return null

  const determineColor = (): "error" | "warning" | "success" => {
    if (Math.round(value) >= 99.99) {
      return "error"
    } else if (value >= 98) {
      return "warning"
    } else {
      return "success"
    }
  }

  const determineValueDisplay = (): string => {
    if (value >= 99.99) {
      return "100%"
    } else if (value === 0) {
      return "N/A"
    } else if (value < 0.01) {
      return "<0.01%"
    } else {
      return `${value.toFixed(2)}%`
    }
  }

  return (
    <InfoTooltip text={<>{tooltipContent}</>} asChild>
      <div
        css={{
          display: "inline-flex",
          position: "relative",
          marginRight: 16,
          height: "fit-content",
          width: "fit-content",
        }}
      >
        <CircularProgress
          variant="determinate"
          sx={{
            color: (theme) =>
              theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
            position: "absolute",
            left: 1.25,
            top: 1.25,
          }}
          size={77.5}
          thickness={2}
          value={100}
        />
        <CircularProgress
          variant="determinate"
          color={determineColor()}
          sx={{
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: "round",
            },
          }}
          size={80}
          thickness={3}
          // We show at minimum, 2% color to represent small values
          value={value <= 2 ? 2 : value > 100 ? 100 : value}
        />
        <Text
          css={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {determineValueDisplay()}
        </Text>
      </div>
    </InfoTooltip>
  )
}
