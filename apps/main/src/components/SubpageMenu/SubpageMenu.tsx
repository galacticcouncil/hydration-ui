import { Flex } from "@galacticcouncil/ui/components"
import { FC, Fragment } from "react"

import { SubpageMenuItem } from "@/components/SubpageMenu/SubpageMenuItem"

export type SubpageItem = {
  readonly to: string
  readonly title: string
  readonly icon?: React.ComponentType
  readonly search?: Record<string, string | boolean>
}

type Props = {
  readonly items: ReadonlyArray<SubpageItem>
  readonly className?: string
  readonly renderItem?: (item: SubpageItem) => React.ReactNode
}

export const SubpageMenu: FC<Props> = ({ items, className, renderItem }) => {
  return (
    <Flex gap={20} sx={{ overflowX: "auto" }} className={className}>
      {items.map((item, index) =>
        renderItem ? (
          <Fragment key={`${item.to}_${index}`}>{renderItem(item)}</Fragment>
        ) : (
          <SubpageMenuItem key={`${item.to}_${index}`} item={item} />
        ),
      )}
    </Flex>
  )
}
