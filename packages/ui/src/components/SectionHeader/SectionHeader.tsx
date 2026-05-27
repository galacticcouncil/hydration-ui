import { ElementType, FC, ReactNode } from "react"

import {
  SSectionHeaderContainer,
  SSectionHeaderTitle,
} from "@/components/SectionHeader/SectionHeader.styled"

type Props = {
  readonly title: string
  readonly as?: ElementType
  readonly className?: string
  readonly hasDescription?: boolean
  readonly actions?: ReactNode
  readonly noTopPadding?: boolean
}

export const SectionHeader: FC<Props> = ({
  title,
  as = "p",
  className,
  hasDescription,
  actions,
  noTopPadding,
}) => {
  return (
    <SSectionHeaderContainer
      hasDescription={hasDescription}
      className={className}
      noTopPadding={noTopPadding}
    >
      <SSectionHeaderTitle as={as} className={className}>
        {title}
      </SSectionHeaderTitle>
      {actions}
    </SSectionHeaderContainer>
  )
}
