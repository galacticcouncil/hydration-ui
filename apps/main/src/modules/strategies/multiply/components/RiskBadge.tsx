import {
  Box,
  Chip,
  type ChipVariant,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { type PairRisk } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import {
  getLiquidationBuffer,
  type RiskLevel,
} from "@/modules/strategies/multiply/utils/risk"

const VARIANT: Record<RiskLevel, ChipVariant> = {
  low: "green",
  medium: "amber",
  high: "red",
}

type RiskBadgeProps = {
  risk: PairRisk
  collateral: string
  debt: string
  /** Health factor at `leverage`, or at max leverage without it. */
  hf: number
  leverage?: number
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  collateral,
  debt,
  hf,
  leverage,
}) => {
  const { t } = useTranslation("strategies")

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
      {/* flex, so the trigger is the chip's height, not a text line's */}
      <Box as="span" display="flex">
        <Chip size="small" rounded variant={VARIANT[risk.level]}>
          {t(`multiply.risk.${risk.level}`)}
        </Chip>
      </Box>
    </Tooltip>
  )
}
