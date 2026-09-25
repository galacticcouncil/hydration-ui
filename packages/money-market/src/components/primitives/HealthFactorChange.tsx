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
import { Fragment } from "react"

import { HealthFactorNumber } from "@/components/primitives/HealthFactorNumber"
import { HealthFactorResult } from "@/utils"

export type HealthFactorChangeProps = FlexProps &
  HealthFactorResult & {
    loading?: boolean
    fontSize?: ThemeUICSSProperties["fontSize"]

    intermediate?: string
    decimals?: number
  }

const displayed = (value: string, decimals: number) =>
  Big(value).toFixed(decimals, Big.roundDown)

export const HealthFactorChange: React.FC<HealthFactorChangeProps> = ({
  current,
  future,
  intermediate,
  decimals = 2,
  isSignificantChange,
  isBelowRiskThreshold,
  loading = false,
  fontSize,
  ...props
}) => {
  const { isUserConsentRequired: _isUserConsentRequired, ...flexProps } = props

  const steps = [
    current,
    ...(intermediate ? [intermediate] : []),
    ...(isSignificantChange || intermediate
      ? [isNaN(Number(future)) ? current : future]
      : []),
  ].reduce<string[]>((acc, value) => {
    const last = acc.at(-1)
    return last !== undefined &&
      displayed(last, decimals) === displayed(value, decimals)
      ? acc
      : [...acc, value]
  }, [])

  return (
    <Flex direction="column" align="flex-end" {...flexProps}>
      <Flex gap="s" direction="row" align="center" justify="flex-end">
        {loading ? (
          <Skeleton height="1em" width={80} />
        ) : (
          steps.map((value, index) => (
            <Fragment key={index}>
              {index > 0 && <Icon size="xs" component={ArrowRight} />}
              <HealthFactorNumber
                value={value}
                fontSize={fontSize}
                decimals={decimals}
              />
            </Fragment>
          ))
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
