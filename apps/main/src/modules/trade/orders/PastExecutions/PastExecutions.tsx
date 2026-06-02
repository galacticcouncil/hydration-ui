import {
  Flex,
  Separator,
  Skeleton,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

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
          <Flex gap="xl" px="l" py="xxl">
            <Skeleton sx={{ flex: 1 }} />
            <Skeleton sx={{ flex: 1 }} />
          </Flex>
        ) : (
          <VirtualizedList
            items={executions}
            maxVisibleItems={5}
            itemSize={65}
            separated
            renderItem={(execution) => (
              <PastExecutionItem
                assetIn={assetIn}
                assetOut={assetOut}
                execution={execution}
              />
            )}
          />
        )}
      </Flex>
    </Flex>
  )
}
