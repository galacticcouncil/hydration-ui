import {
  Flex,
  FlexProps,
  ScrollArea,
  ScrollAreaProps,
} from "@galacticcouncil/ui/components"
import { FC, Fragment } from "react"

import {
  Props as TabMenuItemProps,
  TabMenuItem,
} from "@/components/TabMenu/TabMenuItem"

export type TabItem = {
  readonly to: string
  readonly title: string
  readonly icon?: React.ComponentType
  readonly search?: Record<string, string | boolean>
  readonly resetScroll?: boolean
  readonly exact?: boolean
}

type Props = FlexProps &
  Pick<TabMenuItemProps, "size" | "variant" | "activeVariant"> & {
    readonly items: ReadonlyArray<TabItem>
    readonly className?: string
    readonly ignoreCurrentSearch?: boolean
    readonly renderItem?: (item: TabItem) => React.ReactNode
    readonly horizontalEdgeOffset?: ScrollAreaProps["horizontalEdgeOffset"]
    readonly scrollable?: boolean
  }

export const TabMenu: FC<Props> = ({
  items,
  renderItem,
  gap = "m",
  size,
  variant,
  activeVariant,
  ignoreCurrentSearch,
  horizontalEdgeOffset,
  scrollable = true,
  ...props
}) => {
  const menu = (
    <Flex gap={gap} {...props}>
      {items.map((item, index) =>
        renderItem ? (
          <Fragment key={`${item.to}_${index}`}>{renderItem(item)}</Fragment>
        ) : (
          <TabMenuItem
            key={`${item.to}_${index}`}
            item={item}
            size={size}
            variant={variant}
            activeVariant={activeVariant}
            ignoreCurrentSearch={ignoreCurrentSearch}
          />
        ),
      )}
    </Flex>
  )

  if (!scrollable) return menu

  return (
    <ScrollArea
      orientation="horizontal"
      horizontalEdgeOffset={horizontalEdgeOffset}
    >
      {menu}
    </ScrollArea>
  )
}
