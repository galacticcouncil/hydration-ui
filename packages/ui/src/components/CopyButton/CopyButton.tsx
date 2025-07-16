import { useCopy } from "@galacticcouncil/utils"

import { CheckIcon, CopyIcon } from "@/assets/icons"
import { Icon } from "@/components"

type RenderProps = {
  copied: boolean
}

export type CopyButtonProps = {
  text: string
  delay?: number
  defaultIcon?: React.ComponentType
  copiedIcon?: React.ComponentType
  iconSize?: number
  children?: (props: RenderProps) => React.ReactNode
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled" | "type" | "children"
>

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  delay = 5000,
  defaultIcon = CopyIcon,
  copiedIcon = CheckIcon,
  iconSize = 14,
  children,
  ...props
}) => {
  const { copied, copy } = useCopy(delay)
  return (
    <button
      type="button"
      {...props}
      disabled={copied}
      data-copied={copied}
      onClick={(e) => {
        e.stopPropagation()
        copy(text)
      }}
    >
      {children ? (
        children({ copied })
      ) : (
        <Icon size={iconSize} component={copied ? copiedIcon : defaultIcon} />
      )}
    </button>
  )
}
