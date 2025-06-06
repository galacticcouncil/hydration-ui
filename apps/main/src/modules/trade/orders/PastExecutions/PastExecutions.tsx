import { Box, Flex, Separator, Skeleton } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { PastExecutionsHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsHeader"
import { PastExecutionsList } from "@/modules/trade/orders/PastExecutions/PastExecutionsList"
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
    <Box bg={getToken("surfaces.containers.dim.dimOnBg")} className={className}>
      <PastExecutionsHeader />
      <Flex
        sx={{ overflowY: "hidden" }}
        direction="column"
        gap={4}
        maxHeight={300}
      >
        <PastExecutionsListHeader />
        <Separator />
        {isLoading ? (
          <Skeleton height={100} />
        ) : (
          <PastExecutionsList
            assetIn={assetIn}
            assetOut={assetOut}
            executions={executions}
          />
        )}
      </Flex>
    </Box>
  )
}
