import { Trash2 } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC } from "react"

export const AccountDeleteButton: FC<
  Omit<ComponentProps<"button">, "children">
> = ({ onClick, ...props }) => {
  return (
    <button
      sx={{
        cursor: "pointer",
        color: getToken("text.medium"),
        "&:hover": {
          color: getToken("text.high"),
        },
      }}
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    >
      <Icon size={14} component={Trash2} />
    </button>
  )
}
