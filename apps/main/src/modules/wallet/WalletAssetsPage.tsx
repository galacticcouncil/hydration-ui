import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  DataTable,
  Flex,
  Input,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useState } from "react"

import { useWalletAssetsColumns } from "@/modules/wallet/WalletAssetsPage.utils"
import { useAssets } from "@/providers/assetsProvider"

export const WalletAssetsPage = () => {
  const columns = useWalletAssetsColumns()
  const [search, setSearch] = useState("")
  const { tokens, stableswap, bonds, erc20, isExternal } = useAssets()

  const allTokens = [...tokens, ...stableswap, ...bonds, ...erc20]

  return (
    <Flex direction="column" gap={20}>
      <Input
        customSize="large"
        placeholder="Search..."
        iconStart={Search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <TableContainer as={Paper}>
        <DataTable
          paginated
          pageSize={10}
          globalFilter={search}
          data={allTokens.filter(
            (asset) => asset.isTradable && !isExternal(asset),
          )}
          columns={columns}
        />
      </TableContainer>
    </Flex>
  )
}
