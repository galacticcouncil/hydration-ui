import { Text, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

/** Green when positive, red when negative, neutral otherwise. */
export const apyColor = (value: number | null | undefined) =>
  getToken(
    !value
      ? "text.high"
      : value > 0
        ? "accents.success.emphasis"
        : "accents.danger.secondary",
  )

/** A label over a figure, every figure in the APY's size. */
export const MultiplyStat: React.FC<{
  label: string
  value: React.ReactNode
  color?: React.ComponentProps<typeof Text>["color"]
}> = ({ label, value, color = getToken("text.high") }) => (
  <ValueStats
    wrap
    size="small"
    font="secondary"
    label={label}
    customValue={
      <Text fs="p4" fw={600} color={color}>
        {value}
      </Text>
    }
  />
)
