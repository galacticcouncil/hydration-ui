import { ElementType, FC, ReactNode } from "react"

import {
  SSectionHeaderContainer,
  SSectionHeaderTitle,
} from "@/components/SectionHeader/SectionHeader.styled"

type Props = {
  readonly title: string
  readonly as?: ElementType
  readonly className?: string
  readonly containerClassName?: string
  readonly hasDescription?: boolean
  readonly actions?: ReactNode
}

export const SectionHeader: FC<Props> = ({
  title,
  as = "p",
  className,
  containerClassName,
  hasDescription,
  actions,
}) => {
  return (
    <SSectionHeaderContainer
      hasDescription={hasDescription}
      className={containerClassName}
    >
      <SSectionHeaderTitle as={as} className={className}>
        {title}
      </SSectionHeaderTitle>
      {actions}
    </SSectionHeaderContainer>
  )
}
