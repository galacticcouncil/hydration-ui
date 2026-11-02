import { CheckIcon, CopyIcon } from "@galacticcouncil/ui/assets/icons"
import { Button, ButtonProps } from "@galacticcouncil/ui/components"
import { useCopy } from "@galacticcouncil/utils"
import { FC } from "react"

type Props = Omit<ButtonProps, "onClick"> & {
  text: string
}

export const UserMenuCopyButton: FC<Props> = ({ text, ...props }) => {
  const { copied, copy } = useCopy(5000)

  return (
    <Button
      icon={copied ? CheckIcon : CopyIcon}
      variant="ghost"
      disabled={copied}
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        copy(text)
      }}
    />
  )
}
