import { FC } from "react"
import { LiquidityPositionsTableData } from "../WalletLiquidityPositionsTable.utils"
import { WalletLiquidityPositionsTableDetailsBalance } from "./WalletLiquidityPositionsTableDetailsBalance"
import { Separator } from "../../../../../components/Separator/Separator"
import { WalletLiquidityPositionsTableDetailsChain } from "./WalletLiquidityPositionsTableDetailsChain"

interface Props {
  assetA: LiquidityPositionsTableData["assetA"]
  assetB: LiquidityPositionsTableData["assetB"]
}

export const WalletLiquidityPositionsTableDetails: FC<Props> = ({
  assetA,
  assetB,
}) => {
  return (
    <div sx={{ flex: "row", p: "0 10px", justify: "space-around" }}>
      <div
        sx={{
          flex: "row",
          flexBasis: "50%",
          justify: "flex-start",
          gap: 160,
          align: "center",
        }}
      >
        <WalletLiquidityPositionsTableDetailsBalance
          symbol={assetA.symbol}
          balance={assetA.balance}
          balanceUsd={assetA.balanceUsd}
        />
        <WalletLiquidityPositionsTableDetailsChain
          symbol={assetA.symbol}
          chain={assetA.chain}
        />
      </div>
      <Separator orientation="vertical" size={1} color="white" opacity={0.06} />
      <div
        sx={{
          flex: "row",
          flexBasis: "50%",
          justify: "flex-end",
          gap: 160,
          align: "center",
        }}
      >
        <WalletLiquidityPositionsTableDetailsBalance
          symbol={assetB.symbol}
          balance={assetB.balance}
          balanceUsd={assetB.balanceUsd}
        />
        <WalletLiquidityPositionsTableDetailsChain
          symbol={assetB.symbol}
          chain={assetB.chain}
        />
      </div>
    </div>
  )
}
