import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"

import {
  HealthFactorNumber,
  toDisplayedHealthFactor,
} from "@/modules/money-market-v2/HealthFactorNumber"

type Props = {
  readonly current?: string
  readonly projected?: string
  readonly isLoading?: boolean
}

/** `current → projected`, the arrow only once the change shows at 2 decimals. */
export const HealthFactorChange: FC<Props> = ({
  current,
  projected,
  isLoading,
}) => {
  if (isLoading || current === undefined) {
    return <Skeleton width={80} height="1em" />
  }

  const changes =
    projected !== undefined &&
    toDisplayedHealthFactor(projected) !== toDisplayedHealthFactor(current)

  return (
    <Flex gap="s" align="center">
      <Text fs="p5" fw={500}>
        <HealthFactorNumber value={current} />
      </Text>
      {changes && (
        <>
          <Icon component={ArrowRight} size="s" />
          <Text fs="p5" fw={500}>
            <HealthFactorNumber value={projected} />
          </Text>
        </>
      )}
    </Flex>
  )
}
