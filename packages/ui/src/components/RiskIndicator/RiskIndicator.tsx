import { useTranslation } from "react-i18next"

import { Flex, FlexProps } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken, pxToRem } from "@/utils"

import {
  RISK_COLORS,
  RISK_INDICATOR_SIZES,
  RiskIndicatorSize,
  RiskLevel,
  SRiskDot,
} from "./RiskIndicator.styled"

export type { RiskIndicatorSize, RiskLevel } from "./RiskIndicator.styled"

const LIT_DOTS: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export type RiskIndicatorProps = Omit<FlexProps, "size"> & {
  readonly level: RiskLevel
  readonly withLabel?: boolean
  readonly size?: RiskIndicatorSize
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  withLabel = false,
  size = "medium",
  ...props
}) => {
  const { t } = useTranslation("common")
  const { gap, fs } = RISK_INDICATOR_SIZES[size]

  return (
    <Flex inline align="center" gap="base" {...props}>
      {withLabel && (
        <Text fs={fs} fw={500} lh={1} color={getToken(RISK_COLORS[level])}>
          {t(`risk.${level}`)}
        </Text>
      )}
      <Flex as="span" align="center" gap={pxToRem(gap)}>
        {[0, 1, 2].map((index) => (
          <SRiskDot
            key={index}
            level={level}
            size={size}
            lit={index < LIT_DOTS[level]}
          />
        ))}
      </Flex>
    </Flex>
  )
}
