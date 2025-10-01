import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  FlexProps,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"

import { HealthFactorNumber } from "@/components/primitives/HealthFactorNumber"

export type HealthFactorChangeProps = FlexProps & {
  healthFactor: string
  futureHealthFactor: string
  loading?: boolean
}

export const HealthFactorChange: React.FC<HealthFactorChangeProps> = ({
  healthFactor,
  futureHealthFactor,
  loading = false,
  ...props
}) => {
  if (healthFactor === "-1" && futureHealthFactor === "-1") return null

  const visibleChange =
    Big(healthFactor).toFixed(2, Big.roundDown) !==
    Big(futureHealthFactor).toFixed(2, Big.roundDown)

  return (
    <Flex direction="column" align="flex-end" {...props}>
      <Flex gap={4} direction="row" align="center" justify="flex-end">
        {loading ? (
          <Skeleton height="1em" width={80} />
        ) : (
          <>
            <HealthFactorNumber value={healthFactor} />
            {visibleChange && (
              <>
                <Icon size={14} component={ArrowRight} />
                <HealthFactorNumber
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
      <Text fs={11} lh={1} color={getToken("text.low")} mt={-2}>
        Liquidation at &lt;1.0
      </Text>
    </Flex>
  )
}
