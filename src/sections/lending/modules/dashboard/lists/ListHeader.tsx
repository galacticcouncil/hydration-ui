import { ReactNode } from "react"

import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { ListButtonsColumn } from "./ListButtonsColumn"

interface ListHeaderProps {
  head: ReactNode[]
}

export const ListHeader = ({ head }: ListHeaderProps) => {
  return (
    <ListHeaderWrapper>
      {head.map((title, i) => (
        <ListColumn overFlow={"visible"} key={i} isRow={i === 0}>
          <ListHeaderTitle>{title}</ListHeaderTitle>
        </ListColumn>
      ))}

      <ListButtonsColumn />
    </ListHeaderWrapper>
  )
}
