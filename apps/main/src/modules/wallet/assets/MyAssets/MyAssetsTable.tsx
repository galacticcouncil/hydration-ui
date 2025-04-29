import {
  DataTable,
  DataTableRef,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ForwardedRef, forwardRef } from "react"

import { InvalidAssetRow } from "@/modules/wallet/assets/Invalid/InvalidAssetRow"
import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import {
  MyAssetsTableColumn,
  useMyAssetsColumns,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly searchPhrase: string
  readonly showAllAssets: boolean
}

export const MyAssetsTable = forwardRef(
  ({ searchPhrase, showAllAssets }: Props, ref: ForwardedRef<DataTableRef>) => {
    const { isMobile } = useBreakpoints()
    const { native } = useAssets()

    const { data: tableAssets, isLoading: arePricesLoading } =
      useMyAssetsTableData(showAllAssets)
    const columns = useMyAssetsColumns()

    return (
      <TableContainer as={Paper}>
        <DataTable
          ref={ref}
          isLoading={arePricesLoading}
          paginated
          pageSize={10}
          globalFilter={searchPhrase}
          globalFilterFn={(row) =>
            row.original.symbol
              .toLowerCase()
              .includes(searchPhrase.toLowerCase()) ||
            row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
          }
          data={tableAssets}
          columns={columns}
          expandable={!isMobile}
          initialSorting={[
            { id: MyAssetsTableColumn.Transferable, desc: true },
          ]}
          renderSubComponent={(asset) =>
            asset.id === native.id ? (
              <ExpandedNativeRow asset={asset} />
            ) : (
              <AssetDetailExpanded asset={asset} />
            )
          }
          renderOverride={(asset) =>
            asset.rugCheckData?.warnings.length ? (
              <InvalidAssetRow
                assetId={asset.id}
                origin={asset.origin?.name ?? ""}
              />
            ) : undefined
          }
        />
      </TableContainer>
    )
  },
)

MyAssetsTable.displayName = "MyAssetsTable"
