import {
  defaultRangeExtractor,
  useVirtualizer,
  VirtualItem,
  VirtualizerOptions,
} from "@tanstack/react-virtual"
import { ResponsiveStyleValue } from "@theme-ui/css"
import { useEffect, useRef } from "react"
import { clamp, isNullish } from "remeda"

import {
  SList,
  SListItem,
  SStickyItem,
  SStickySection,
} from "@/components/VirtualizedList/VirtualizedList.styled"
import { useResponsiveValue, useUiScale } from "@/styles/media"

import { ScrollArea, ScrollAreaProps } from "../ScrollArea"

type VirtualizerProps = Pick<
  VirtualizerOptions<HTMLDivElement, HTMLDivElement>,
  "overscan" | "getItemKey"
>

type VirtualizedListProps<T> = VirtualizerProps &
  ScrollAreaProps & {
    itemSize: number | ((item: T, index: number) => number)
    /** Sticky items pin to the top until the next sticky item pushes them out. */
    isItemSticky?: (item: T, index: number) => boolean
    items: readonly T[]
    renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode
    initialScrollIndex?: number
    maxVisibleItems?: ResponsiveStyleValue<number>
    separated?: boolean
    onEndReached?: () => void
  }

function VirtualizedList<T>({
  items,
  renderItem,
  overscan = 5,
  itemSize: baseItemSize,
  isItemSticky,
  maxVisibleItems,
  getItemKey,
  initialScrollIndex,
  separated = false,
  onEndReached,
  ...props
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const hasScrolledToInitial = useRef(false)
  const onEndReachedForLength = useRef<number | null>(null)

  const uiScale = useUiScale()

  const getSize = (index: number) =>
    (typeof baseItemSize === "number"
      ? baseItemSize
      : baseItemSize(items[index], index)) * uiScale
  // ponytail: max-height math assumes uniform rows; uses the first row's size
  const itemSize = items.length ? getSize(0) : 0

  const maxVisible = useResponsiveValue(maxVisibleItems, 0)

  const stickyIndexes = isItemSticky
    ? items.flatMap((item, index) => (isItemSticky(item, index) ? [index] : []))
    : []

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getSize,
    overscan,
    getItemKey: getItemKey || ((index) => index),
    // Keep the current section's sticky item rendered once it scrolls past
    rangeExtractor: (range) => {
      const active = stickyIndexes.findLast(
        (index) => index <= range.startIndex,
      )
      const indexes = defaultRangeExtractor(range)
      return active === undefined || indexes.includes(active)
        ? indexes
        : [active, ...indexes]
    },
  })

  useEffect(() => {
    if (
      hasScrolledToInitial.current ||
      isNullish(initialScrollIndex) ||
      items.length === 0
    )
      return
    const index = clamp(initialScrollIndex, {
      min: 0,
      max: items.length - 1,
    })
    rowVirtualizer.scrollToIndex(index, {
      align: "start",
      behavior: "auto",
    })
    hasScrolledToInitial.current = true
  }, [initialScrollIndex, items.length, rowVirtualizer])

  const virtualItems = rowVirtualizer.getVirtualItems()
  // A sticky item spans its whole section, so the browser pins it and pushes it
  // out at the next section natively, in step with the scroll
  const getSectionSize = (index: number, start: number) => {
    const next = stickyIndexes.find((sticky) => sticky > index)
    const end =
      next === undefined
        ? rowVirtualizer.getTotalSize()
        : (rowVirtualizer.measurementsCache[next]?.start ?? start)
    return end - start
  }
  const lastRenderedIndex = virtualItems.at(-1)?.index

  useEffect(() => {
    if (!onEndReached || isNullish(lastRenderedIndex)) return
    if (lastRenderedIndex < items.length - 1 - overscan) return
    // Fire once per list length. lastRenderedIndex ticks through the
    // overscan zone, which would otherwise invoke the loader repeatedly
    // before the list has grown.
    if (onEndReachedForLength.current === items.length) return
    onEndReachedForLength.current = items.length
    onEndReached()
  }, [onEndReached, lastRenderedIndex, items.length, overscan])

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
        {virtualItems.map((virtualItem) =>
          stickyIndexes.includes(virtualItem.index) ? (
            <SStickySection
              key={virtualItem.key}
              data-virtual-index={virtualItem.index}
              size={getSectionSize(virtualItem.index, virtualItem.start)}
              start={virtualItem.start}
            >
              <SStickyItem size={virtualItem.size}>
                {renderItem(items[virtualItem.index], virtualItem)}
              </SStickyItem>
            </SStickySection>
          ) : (
            <SListItem
              key={virtualItem.key}
              data-virtual-index={virtualItem.index}
              size={virtualItem.size}
              start={virtualItem.start}
              bordered={separated}
            >
              {renderItem(items[virtualItem.index], virtualItem)}
            </SListItem>
          ),
        )}
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
