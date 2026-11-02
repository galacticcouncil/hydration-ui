import { BoxProps } from "@galacticcouncil/ui/components"

import { SOptionTile } from "@/components/account/OptionTile.styled"

type Props = BoxProps & {
  readonly onSelect: () => void
}

export const OptionTile = ({ onSelect, ...props }: Props) => (
  <SOptionTile
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return
      if (event.key !== "Enter" && event.key !== " ") return

      event.preventDefault()
      onSelect()
    }}
    {...props}
  />
)
