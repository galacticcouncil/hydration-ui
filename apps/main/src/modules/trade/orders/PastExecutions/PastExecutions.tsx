import { Flex, Separator, Skeleton } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"

import { PastExecutionItem } from "@/modules/trade/orders/PastExecutions/PastExecutionItem"
import { PastExecutionsHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsHeader"
import { PastExecutionsListHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsListHeader"
import { usePastExecutionsData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutions: FC<Props> = ({ scheduleId, className }) => {
  const { assetIn, assetOut, executions, isLoading } =
    usePastExecutionsData(scheduleId)

  return (
    <Flex
      direction="column"
      bg={getToken("surfaces.containers.dim.dimOnBg")}
      className={className}
    >
      <PastExecutionsHeader />
      <Flex direction="column" gap="s">
        <PastExecutionsListHeader />
        <Separator />
        {isLoading ? (
          <Skeleton height={100} />
        ) : (
          <Flex direction="column" gap="xs" px="xxl">
            {executions.map((execution, index) => (
              <Fragment key={execution.id}>
                {index > 0 && <Separator sx={{ flexShrink: 0 }} mx="-xl" />}
                <PastExecutionItem
                  assetIn={assetIn}
                  assetOut={assetOut}
                  execution={execution}
                />
              </Fragment>
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
