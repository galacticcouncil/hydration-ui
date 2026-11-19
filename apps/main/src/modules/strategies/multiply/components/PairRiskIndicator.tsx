import {
  Box,
  RiskIndicator,
  type RiskIndicatorSize,
  Skeleton,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { type PairRisk } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import { getLiquidationBuffer } from "@/modules/strategies/multiply/utils/risk"

type PairRiskIndicatorProps = {
  withLabel?: boolean
  size?: RiskIndicatorSize
} & (
  | {
      risk: PairRisk
      collateral: string
      debt: string
      /** Health factor at `leverage`, or at max leverage without it. */
      hf: number
      leverage?: number
    }
  | {
      /** Null while the risk loads: renders a skeleton. */
      risk: null
      collateral?: string
      debt?: string
      hf?: number
      leverage?: number
    }
)

export const PairRiskIndicator: React.FC<PairRiskIndicatorProps> = ({
  withLabel,
  size,
  ...props
}) => {
  const { t } = useTranslation("strategies")

  if (props.risk === null)
    return (
      <Box as="span" display="inline-flex" position="relative">
        <RiskIndicator
          level="medium"
          withLabel={withLabel}
          size={size}
          sx={{ visibility: "hidden" }}
          aria-hidden
        />
        <Skeleton
          borderRadius={9999}
          style={{ position: "absolute", inset: 0 }}
        />
      </Box>
    )

  const { risk, collateral, debt, hf, leverage } = props

  const why =
    risk.level === "low"
      ? t("multiply.risk.correlated")
      : risk.largestFall === null
        ? t("multiply.risk.noHistory")
        : t(leverage ? "multiply.risk.fallAt" : "multiply.risk.fall", {
            leverage:
              leverage && t("cards.multiply.leverage", { value: leverage }),
            collateral,
            debt,
            fall: risk.largestFall * 100,
            buffer: getLiquidationBuffer(hf) * 100,
          })

  return (
    <Tooltip text={why} side="left" asChild>
      <RiskIndicator level={risk.level} withLabel={withLabel} size={size} />
    </Tooltip>
  )
}
