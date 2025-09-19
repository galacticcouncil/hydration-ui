import { FC } from "react"
import { ClaimButton } from "sections/wallet/strategy/ClaimButton/ClaimButton"
import { WalletStrategyTitle } from "sections/wallet/strategy/WalletStrategyTitle"

export const WalletStrategyHeader: FC = () => {
  return (
    <div
      sx={{
        flex: ["column", "row"],
        justify: "space-between",
        align: ["start", "center"],
        gap: [20, 12],
      }}
    >
      <WalletStrategyTitle />
      <ClaimButton />
    </div>
  )
}
