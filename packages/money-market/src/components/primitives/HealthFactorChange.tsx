import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { HealthFactorNumber } from "@/components/primitives/HealthFactorNumber"

export type HealthFactorChangeProps = {
  healthFactor: string
  futureHealthFactor: string
  loading?: boolean
}

export const HealthFactorChange: React.FC<HealthFactorChangeProps> = ({
  healthFactor,
  futureHealthFactor,
  loading = false,
}) => {
  if (healthFactor === "-1" && futureHealthFactor === "-1") return null

  const visibleChange =
    Number(healthFactor).toFixed(2) !== Number(futureHealthFactor).toFixed(2)

  return (
    <Box>
      <Flex direction="row" align="center" justify="flex-end">
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
      <Text fs={11} color={getToken("text.low")}>
        Liquidation at &lt;1.0
      </Text>
    </Box>
  )
}
