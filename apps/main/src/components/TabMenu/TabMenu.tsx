import { Flex, FlexProps } from "@galacticcouncil/ui/components"
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
}

type Props = FlexProps &
  Pick<TabMenuItemProps, "size" | "variant" | "activeVariant"> & {
    readonly items: ReadonlyArray<TabItem>
    readonly className?: string
    readonly renderItem?: (item: TabItem) => React.ReactNode
  }

export const TabMenu: FC<Props> = ({
  items,
  renderItem,
  gap = 12,
  size,
  variant,
  activeVariant,
  ...props
}) => {
  return (
    <Flex sx={{ overflowX: "auto" }} gap={gap} {...props}>
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
          />
        ),
      )}
    </Flex>
  )
}
