import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useMemo } from "react"

import { InvalidAssetRow } from "@/modules/wallet/assets/Invalid/InvalidAssetRow"
import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import {
  MyAsset,
  MyAssetsTableColumn,
  useMyAssetsColumns,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly searchPhrase: string
  readonly showAllAssets: boolean
}

export const MyAssetsTable: FC<Props> = ({ searchPhrase, showAllAssets }) => {
  const { isMobile } = useBreakpoints()

  const { native, all, isExternal } = useAssets()
  const balances = useAccountData((data) => data.balances)

  const ownedAssets = useMemo(
    () =>
      Array.from(all.values())
        .filter((asset) => !isExternal(asset) || !!asset.name)
        .map<MyAsset | null>((asset) => {
          const balance = balances[asset.id]

          if (!showAllAssets && !balance) {
            return null
          }

          return {
            ...asset,
            total: scaleHuman(balance?.total ?? 0n, asset.decimals),
            transferable: scaleHuman(balance?.free ?? 0n, asset.decimals),
            // TODO 1071 can stake for asset
            canStake: asset.symbol === "HDX",
          }
        })
        .filter((asset) => !!asset),
    [all, balances, showAllAssets, isExternal],
  )

  const columns = useMyAssetsColumns()

  return (
    <TableContainer as={Paper}>
      <DataTable
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        data={ownedAssets}
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
}
