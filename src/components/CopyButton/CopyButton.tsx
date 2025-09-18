import { useCopy } from "hooks/useCopy"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { ButtonTransparent } from "components/Button/Button"

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
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  delay = 5000,
  defaultIcon: DefaultIconComponent = CopyIcon,
  copiedIcon: CopiedIconComponent = CheckIcon,
  iconSize = 14,
  disabled,
  children,
  ...props
}) => {
  const { copied, copy } = useCopy(delay)

  return (
    <ButtonTransparent
      type="button"
      {...props}
      disabled={disabled || copied}
      data-copied={copied}
      onClick={(e) => {
        e.stopPropagation()
        copy(text)
        props.onClick?.(e)
      }}
    >
      {children ? (
        children({ copied })
      ) : (
        <Icon
          size={iconSize}
          sx={{ color: copied ? "green400" : "brightBlue300" }}
          icon={copied ? <CopiedIconComponent /> : <DefaultIconComponent />}
        />
      )}
    </ButtonTransparent>
  )
}
