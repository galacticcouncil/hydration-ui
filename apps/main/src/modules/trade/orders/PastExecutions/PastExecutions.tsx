import {
  Flex,
  LoadingButton,
  Separator,
  Skeleton,
  Stack,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { PastExecutionItem } from "@/modules/trade/orders/PastExecutions/PastExecutionItem"
import { PastExecutionsHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsHeader"
import { PastExecutionsListHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsListHeader"
import { usePastExecutionsData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"

const PAST_EXECUTION_ITEM_SIZE = 65
const PAST_EXECUTIONS_MAX_VISIBLE_ITEMS = 5

const pastExecutionsListProps = {
  itemSize: PAST_EXECUTION_ITEM_SIZE,
  maxVisibleItems: PAST_EXECUTIONS_MAX_VISIBLE_ITEMS,
  separated: true as const,
}

type Props = {
  readonly scheduleId: number
  readonly className?: string
}

export const PastExecutions: FC<Props> = ({ scheduleId, className }) => {
  const { t } = useTranslation("trade")
  const {
    assetIn,
    assetOut,
    executions,
    isLoading,
    hasMore,
    isLoadingAll,
    loadAll,
    totalCount,
  } = usePastExecutionsData(scheduleId)

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
          <VirtualizedList
            {...pastExecutionsListProps}
            items={Array.from(
              { length: PAST_EXECUTIONS_MAX_VISIBLE_ITEMS },
              (_, index) => index,
            )}
            renderItem={() => (
              <Flex
                justify="space-between"
                align="center"
                flex={1}
                px="l"
                py="base"
                gap="xl"
              >
                <Stack flex={1}>
                  <Skeleton width="50%" />
                  <Skeleton width="70%" height="0.75em" />
                </Stack>
                <Skeleton width="30%" sx={{ flex: 1, textAlign: "center" }} />
              </Flex>
            )}
          />
        ) : (
          <VirtualizedList
            {...pastExecutionsListProps}
            items={executions}
            renderItem={(execution) => (
              <PastExecutionItem
                assetIn={assetIn}
                assetOut={assetOut}
                execution={execution}
              />
            )}
          />
        )}
        {hasMore && (
          <Flex justify="center" px="l" pb="l">
            <LoadingButton
              variant="tertiary"
              outline
              isLoading={isLoadingAll}
              onClick={loadAll}
            >
              {t("trade.orders.pastExecutions.loadAll", { count: totalCount })}
            </LoadingButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
