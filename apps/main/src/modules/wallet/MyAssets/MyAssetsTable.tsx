import {
  DataTable,
  DataTableRef,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ForwardedRef, forwardRef, useMemo } from "react"

import { InvalidAssetRow } from "@/modules/wallet/Invalid/InvalidAssetRow"
import { AssetDetailExpanded } from "@/modules/wallet/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/MyAssets/ExpandedNativeRow"
import {
  MyAsset,
  MyAssetsTableColumn,
  useMyAssetsColumns,
} from "@/modules/wallet/MyAssets/MyAssetsTable.columns"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly searchPhrase: string
  readonly showAllAssets: boolean
}

export const MyAssetsTable = forwardRef(
  ({ searchPhrase, showAllAssets }: Props, ref: ForwardedRef<DataTableRef>) => {
    const { isMobile } = useBreakpoints()

    const { native, all, isExternal } = useAssets()
    const balances = useAccountData((data) => data.balances)

    const tableAssets = useMemo(() => {
      const assetsWithBalance = showAllAssets
        ? Array.from(all.values()).map((asset) => ({
            ...asset,
            balance: balances[asset.id],
          }))
        : Object.entries(balances)
            .map(([assetId, balance]) => {
              const asset = all.get(assetId)

              if (!asset) {
                return null
              }

              return {
                ...asset,
                balance,
              }
            })
            .filter((asset) => !!asset)

      return assetsWithBalance
        .filter((asset) => !isExternal(asset) || !!asset.name)
        .map<MyAsset>((asset) => ({
          ...asset,
          total: scaleHuman(balances[asset.id]?.total ?? 0n, asset.decimals),
          transferable: scaleHuman(
            balances[asset.id]?.free ?? 0n,
            asset.decimals,
          ),
          canStake: asset.id === native.id,
        }))
    }, [all, native.id, balances, showAllAssets, isExternal])

    const columns = useMyAssetsColumns()

    return (
      <TableContainer as={Paper}>
        <DataTable
          ref={ref}
          paginated
          pageSize={10}
          globalFilter={searchPhrase}
          data={tableAssets}
          columns={columns}
          expandable={!isMobile}
          initialSorting={[{ id: MyAssetsTableColumn.Total, desc: true }]}
          renderSubComponent={(asset) =>
            asset.id === native.id ? (
              <ExpandedNativeRow assetId={asset.id} />
            ) : (
              <AssetDetailExpanded assetId={asset.id} />
            )
          }
          renderOverride={(asset) =>
            // TODO 1071 rug check
            asset.id === "10" ? (
              <InvalidAssetRow assetId={asset.id} origin="Assethub" />
            ) : undefined
          }
        />
      </TableContainer>
    )
  },
)

MyAssetsTable.displayName = "MyAssetsTable"
