import {
  Flex,
  Skeleton,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

const ITEM_SIZE = 65
const MAX_VISIBLE_ITEMS = 5

type XcTwapScanListProps<T> = {
  readonly title: string
  readonly items: ReadonlyArray<T>
  readonly isLoading: boolean
  readonly isUnavailable: boolean
  readonly renderItem: (item: T) => ReactNode
}

export const XcTwapScanList = <T,>({
  title,
  items,
  isLoading,
  isUnavailable,
  renderItem,
}: XcTwapScanListProps<T>) => {
  const { t } = useTranslation("trade")

  const renderBody = () => {
    if (isUnavailable) {
      return (
        <Text fs="p5" color={getToken("text.low")} px="l" pb="l">
          {t("trade.orders.xc.status.detailsUnavailable")}
        </Text>
      )
    }

    if (isLoading) {
      return (
        <Stack px="l" pb="l" gap="s">
          <Skeleton width="50%" />
          <Skeleton width="70%" height="0.75em" />
        </Stack>
      )
    }

    if (items.length === 0) {
      return (
        <Text fs="p5" color={getToken("text.low")} px="l" pb="l">
          {t("trade.orders.pastExecutions.empty")}
        </Text>
      )
    }

    return (
      <VirtualizedList
        itemSize={ITEM_SIZE}
        maxVisibleItems={MAX_VISIBLE_ITEMS}
        separated
        items={items}
        renderItem={renderItem}
      />
    )
  }

  return (
    <Flex direction="column">
      <Text
        fw={500}
        fs="p2"
        font="primary"
        color={getToken("text.high")}
        py="xl"
        px="l"
      >
        {title}
      </Text>
      {renderBody()}
    </Flex>
  )
}
