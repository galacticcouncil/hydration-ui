import { AccountTile, ButtonTransparent } from "@galacticcouncil/ui/components"
import { FC } from "react"

type DepositAccountButtonProps = {
  name: string
  address: string
  active?: boolean
  onClick?: () => void
}

export const DepositAccountButton: FC<DepositAccountButtonProps> = ({
  onClick,
  ...props
}) =>
  onClick ? (
    <ButtonTransparent
      width="100%"
      onClick={onClick}
      sx={{ textAlign: "left" }}
    >
      <AccountTile {...props} width="100%" />
    </ButtonTransparent>
  ) : (
    <AccountTile {...props} width="100%" />
  )
