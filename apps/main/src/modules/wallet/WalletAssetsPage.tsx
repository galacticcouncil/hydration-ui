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
import { useAssetRegistry } from "@/states/assetRegistry"

export const WalletAssetsPage = () => {
  const { assets } = useAssetRegistry()
  const columns = useWalletAssetsColumns()
  const [search, setSearch] = useState("")

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
          data={assets.filter(({ isTradable }) => isTradable)}
          columns={columns}
        />
      </TableContainer>
    </Flex>
  )
}
