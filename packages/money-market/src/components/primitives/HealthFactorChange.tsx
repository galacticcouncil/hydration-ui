import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  FlexProps,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { ThemeUICSSProperties } from "@galacticcouncil/ui/types"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"

import { HealthFactorNumber } from "@/components/primitives/HealthFactorNumber"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "@/ui-config/misc"

export type HealthFactorChangeProps = FlexProps & {
  healthFactor: string
  futureHealthFactor: string
  loading?: boolean
  fontSize?: ThemeUICSSProperties["fontSize"]
}

export const HealthFactorChange: React.FC<HealthFactorChangeProps> = ({
  healthFactor,
  futureHealthFactor,
  loading = false,
  fontSize,
  ...props
}) => {
  if (healthFactor === "-1" && futureHealthFactor === "-1") return null

  const visibleChange =
    Big(healthFactor).toFixed(2, Big.roundDown) !==
    Big(futureHealthFactor).toFixed(2, Big.roundDown)

  const isBelowRiskThreshold = Big(healthFactor).lt(
    HEALTH_FACTOR_RISK_THRESHOLD,
  )

  return (
    <Flex direction="column" align="flex-end" {...props}>
      <Flex gap="s" direction="row" align="center" justify="flex-end">
        {loading ? (
          <Skeleton height="1em" width={80} />
        ) : (
          <>
            <HealthFactorNumber value={healthFactor} fontSize={fontSize} />
            {visibleChange && (
              <>
                <Icon size="xs" component={ArrowRight} />
                <HealthFactorNumber
                  fontSize={fontSize}
                  value={
                    isNaN(Number(futureHealthFactor))
                      ? healthFactor
                      : futureHealthFactor
                  }
                />
              </>
            )}
          </>
        )}
      </Flex>
      {isBelowRiskThreshold && (
        <Text fs="p6" lh={1} color={getToken("text.low")} mt={-2}>
          Liquidation at &lt;1.0
        </Text>
      )}
    </Flex>
  )
}
