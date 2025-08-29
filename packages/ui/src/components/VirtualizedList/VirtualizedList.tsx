import {
  useVirtualizer,
  VirtualItem,
  VirtualizerOptions,
} from "@tanstack/react-virtual"
import { ResponsiveStyleValue } from "@theme-ui/css"
import { useEffect, useRef } from "react"
import { isNullish } from "remeda"

import {
  SList,
  SListItem,
} from "@/components/VirtualizedList/VirtualizedList.styled"
import { useResponsiveValue } from "@/styles/media"

import { ScrollArea, ScrollAreaProps } from "../ScrollArea"

type VirtualizerProps = Pick<
  VirtualizerOptions<HTMLDivElement, HTMLDivElement>,
  "overscan" | "getItemKey"
>

type VirtualizedListProps<T> = VirtualizerProps &
  ScrollAreaProps & {
    itemSize: number
    items: readonly T[]
    renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode
    initialScrollIndex?: number
    maxVisibleItems?: ResponsiveStyleValue<number>
  }

function VirtualizedList<T>({
  items,
  renderItem,
  overscan = 5,
  itemSize,
  maxVisibleItems,
  getItemKey,
  initialScrollIndex,
  ...props
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const maxVisible = useResponsiveValue(maxVisibleItems, 0)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan,
    getItemKey: getItemKey || ((index) => index),
  })

  useEffect(() => {
    if (isNullish(initialScrollIndex) || items.length === 0) return
    const index = Math.max(0, Math.min(initialScrollIndex, items.length - 1))
    rowVirtualizer.scrollToIndex(index, {
      align: "start",
      behavior: "auto",
    })
  }, [initialScrollIndex, items.length, rowVirtualizer])

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <ScrollArea
      viewportRef={parentRef}
      {...props}
      height={
        maxVisible > 0
          ? getMaxHeight(items.length, itemSize, maxVisible)
          : props.height
      }
    >
      <SList height={rowVirtualizer.getTotalSize()}>
        {virtualItems.map((virtualItem) => (
          <SListItem
            key={virtualItem.key}
            data-virtual-index={virtualItem.index}
            size={virtualItem.size}
            start={virtualItem.start}
          >
            {renderItem(items[virtualItem.index], virtualItem)}
          </SListItem>
        ))}
      </SList>
    </ScrollArea>
  )
}

function getMaxHeight(
  itemCount: number,
  itemSize: number,
  maxVisibleItems: number,
) {
  const maxHeight = itemSize * maxVisibleItems
  if (itemCount * itemSize <= maxHeight) {
    return "auto"
  }
  return maxHeight
}

export { VirtualizedList }
