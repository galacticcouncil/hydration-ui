import { Box, Flex, Separator, Skeleton } from "@galacticcouncil/ui/components"
import {
  getMinusTokenPx,
  getToken,
  getTokenPx,
} from "@galacticcouncil/ui/utils"
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
          <Flex
            direction="column"
            gap={2}
            px={getTokenPx("containers.paddings.primary")}
            sx={{ overflowY: "auto" }}
          >
            {executions.map((execution, index) => (
              <Fragment key={execution.id}>
                {index > 0 && (
                  <Separator
                    sx={{ flexShrink: 0 }}
                    mx={getMinusTokenPx("containers.paddings.primary")}
                  />
                )}
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
    </Box>
  )
}
