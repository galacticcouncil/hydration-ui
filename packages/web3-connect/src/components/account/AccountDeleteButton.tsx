import { Trash2 } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"
import { ComponentProps, FC } from "react"

import { SAccountActionButton } from "@/components/account/AccountActionButton.styled"

export const AccountDeleteButton: FC<
  Omit<ComponentProps<"button">, "children">
> = ({ onClick, ...props }) => {
  return (
    <SAccountActionButton
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    >
      <Icon size="s" component={Trash2} />
    </SAccountActionButton>
  )
}
