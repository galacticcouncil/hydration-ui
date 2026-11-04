import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

type Props = {
  // what the swaps leave the user with against the oracle: positive is a gain
  value: number
  // share of this amount, for the percent
  base: number
  symbol: string
}

// "+0.12 PRIME (+0.49%)": the percent in green for a gain, red for a cost.
export const MultiplySwapResult: React.FC<Props> = ({
  value,
  base,
  symbol,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const prefix = value > 0 ? "+" : ""

  return (
    <Text fs="p5" fw={500}>
      {t("common:currency", { prefix, value, symbol })}{" "}
      <Text
        as="span"
        color={
          value > 0
            ? getToken("accents.success.emphasis")
            : value < 0
              ? getToken("accents.danger.emphasis")
              : undefined
        }
      >
        (
        {t("common:percent", {
          prefix,
          value: base > 0 ? (value / base) * 100 : 0,
        })}
        )
      </Text>
    </Text>
  )
}
