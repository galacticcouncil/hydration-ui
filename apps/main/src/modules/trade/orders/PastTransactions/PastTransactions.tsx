import { Box, Flex, Separator, Skeleton } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { PastTransactionsHeader } from "@/modules/trade/orders/PastTransactions/PastTransactionsHeader"
import { PastTransactionsList } from "@/modules/trade/orders/PastTransactions/PastTransactionsList"
import { PastTransactionsListHeader } from "@/modules/trade/orders/PastTransactions/PastTransactionsListHeader"
import { usePastTransactionsData } from "@/modules/trade/orders/PastTransactions/usePastTransactionsData"

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastTransactions: FC<Props> = ({ scheduleId, className }) => {
  const { assetIn, assetOut, executions, isLoading } =
    usePastTransactionsData(scheduleId)

  return (
    <Box bg={getToken("surfaces.containers.dim.dimOnBg")} className={className}>
      <PastTransactionsHeader />
      <Flex
        sx={{ overflowY: "hidden" }}
        direction="column"
        gap={4}
        maxHeight={300}
      >
        <PastTransactionsListHeader />
        <Separator />
        {isLoading ? (
          <Skeleton height={100} />
        ) : (
          <PastTransactionsList
            assetIn={assetIn}
            assetOut={assetOut}
            executions={executions}
          />
        )}
      </Flex>
    </Box>
  )
}
