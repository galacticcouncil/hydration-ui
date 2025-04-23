import { forwardRef } from "react"

import {
  SChainSelect,
  SChainSelectProps,
} from "@/components/ChainSelect/ChainSelect.styled"

type Props = SChainSelectProps

export const ChainSelect = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "desktop", isActive, children, ...props }, ref) => {
    return (
      <SChainSelect ref={ref} variant={variant} isActive={isActive} {...props}>
        {children}
      </SChainSelect>
    )
  },
)

ChainSelect.displayName = "ChainSelect"
