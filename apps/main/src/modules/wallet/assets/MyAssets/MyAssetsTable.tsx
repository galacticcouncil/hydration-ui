import {
  DataTable,
  DataTableRef,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, Ref } from "react"

import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import { MyAssetsEmptyState } from "@/modules/wallet/assets/MyAssets/MyAssetsEmptyState"
import {
  MyAsset,
  useMyAssetsColumns,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly data: Array<MyAsset>
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly ref?: Ref<DataTableRef>
}

export const MyAssetsTable: FC<Props> = ({
  data,
  isLoading,
  searchPhrase,
  ref,
}) => {
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const columns = useMyAssetsColumns()

  return (
    <TableContainer as={Paper}>
      <DataTable
        ref={ref}
        isLoading={isLoading}
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
        }
        data={data}
        columns={columns}
        expandable={!isMobile}
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow asset={asset} />
          ) : (
            <AssetDetailExpanded asset={asset} />
          )
        }
        emptyState={<MyAssetsEmptyState />}
      />
    </TableContainer>
  )
}
