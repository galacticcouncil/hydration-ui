import { valueToBigNumber } from "@aave/math-utils"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { getHealthFactorColor } from "sections/lending/utils/utils"
import { ResponsiveValue } from "utils/responsive"

type HealthFactorNumberProps = {
  value: string
  onInfoClick?: () => void
  fontSize?: ResponsiveValue<number>
}

export const HealthFactorNumber = ({
  value,
  onInfoClick,
  fontSize = 14,
}: HealthFactorNumberProps) => {
  const formattedHealthFactor = Number(
    valueToBigNumber(value).toFixed(2, BigNumber.ROUND_DOWN),
  )
  const healthFactorColor = getHealthFactorColor(value)

  return (
    <div
      sx={{
        flex: "row",
        gap: 10,
      }}
    >
      {value === "-1" ? (
        <Text fs={20} lh={20} color="green400">
          ∞
        </Text>
      ) : (
        <Text
          fs={fontSize}
          lh={fontSize}
          font="GeistSemiBold"
          css={{ color: healthFactorColor }}
        >
          {formattedHealthFactor}
        </Text>
      )}

      {onInfoClick && (
        <Button
          sx={{ mt: -2 }}
          css={{
            color: healthFactorColor,
            borderColor: "currentColor",
            background: "transparent",
          }}
          size="micro"
          onClick={onInfoClick}
        >
          Risk Details
        </Button>
      )}
    </div>
  )
}
