import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC } from "react"

import { LiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded"
import {
  useMyLiquidityColumns,
  WalletLiquidityRow as MyLiquidityRow,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"

const data: MyLiquidityRow[] = [
  {
    assetId: "1",
    positions: [
      {
        name: "USDC/USDT",
        initialValue: 1000,
        currentValue: 1000,
        rewards: 10,
      },
      {
        name: "USDC/USDT",
        initialValue: 1000,
        currentValue: 1000,
        rewards: 10,
      },
    ],
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
  {
    assetId: "2",
    positions: [
      {
        name: "USDC/USDT",
        initialValue: 1000,
        currentValue: 1000,
        rewards: 10,
      },
    ],
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
  {
    assetId: "3",
    positions: [
      {
        name: "USDC/USDT",
        initialValue: 1000,
        currentValue: 1000,
        rewards: 5.24,
      },
    ],
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
]

type Props = {
  readonly searchPhrase: string
}

export const MyLiquidityTable: FC<Props> = ({ searchPhrase }) => {
  const { isMobile } = useBreakpoints()
  const columns = useMyLiquidityColumns()

  return (
    <TableContainer as={Paper}>
      <DataTable
        data={data}
        columns={columns}
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        expandable={!isMobile}
        renderSubComponent={(asset) => (
          <LiquidityDetailExpanded
            assetId={asset.assetId}
            positions={asset.positions}
          />
        )}
      />
    </TableContainer>
  )
}
