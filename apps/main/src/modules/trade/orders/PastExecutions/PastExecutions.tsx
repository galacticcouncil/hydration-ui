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
import { PastExecutionData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"
import { TAsset } from "@/providers/assetsProvider"

const PAST_EXECUTION_ITEM_SIZE = 65
const PAST_EXECUTIONS_MAX_VISIBLE_ITEMS = 5

const pastExecutionsListProps = {
  itemSize: PAST_EXECUTION_ITEM_SIZE,
  maxVisibleItems: PAST_EXECUTIONS_MAX_VISIBLE_ITEMS,
  separated: true as const,
}

export type PastExecutionsProps = {
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly executions: ReadonlyArray<PastExecutionData>
  readonly isLoading: boolean
  readonly hasMore?: boolean
  readonly isLoadingAll?: boolean
  readonly loadAll?: () => void
  readonly totalCount?: number
  readonly onEndReached?: () => void
  readonly className?: string
}

export const PastExecutions: FC<PastExecutionsProps> = ({
  assetIn,
  assetOut,
  executions,
  isLoading,
  hasMore,
  isLoadingAll,
  loadAll,
  totalCount,
  onEndReached,
  className,
}) => {
  const { t } = useTranslation("trade")

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
            onEndReached={onEndReached}
            renderItem={(execution) => (
              <PastExecutionItem
                assetIn={assetIn}
                assetOut={assetOut}
                execution={execution}
              />
            )}
          />
        )}
        {loadAll && hasMore && (
          <Flex justify="center" px="l" pb="l">
            <LoadingButton
              variant="tertiary"
              outline
              isLoading={isLoadingAll ?? false}
              onClick={loadAll}
            >
              {t("trade.orders.pastExecutions.loadAll", {
                count: totalCount ?? 0,
              })}
            </LoadingButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
