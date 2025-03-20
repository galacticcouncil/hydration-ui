import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useMemo } from "react"

import { AssetDetailExpanded } from "@/modules/wallet/MyAssets/AssetDetailExpanded"
import { ExpandedNativeRow } from "@/modules/wallet/MyAssets/ExpandedNativeRow"
import { InvalidAssetRow } from "@/modules/wallet/MyAssets/InvalidAssetRow"
import {
  MyAsset,
  useMyAssetsColumns,
} from "@/modules/wallet/MyAssets/MyAssetsTable.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly searchPhrase: string
}

export const MyAssetsTable: FC<Props> = ({ searchPhrase }) => {
  const { isMobile } = useBreakpoints()
  const { tokens, stableswap, bonds, erc20, native, isExternal } = useAssets()
  const columns = useMyAssetsColumns()

  const filteredTokens = useMemo(
    () =>
      [...tokens, ...stableswap, ...bonds, ...erc20].filter(
        (asset) => asset.isTradable && !isExternal(asset),
      ),
    [tokens, stableswap, bonds, erc20, isExternal],
  )

  // TODO integrate
  const assets = useMemo(() => {
    return filteredTokens.map<MyAsset>((asset) => ({
      ...asset,
      total: 12345678,
      transferable: 12345678,
      canStake: asset.symbol === "USDC",
    }))
  }, [filteredTokens])

  return (
    <TableContainer as={Paper}>
      <DataTable
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        data={assets}
        columns={columns}
        expandable={!isMobile}
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow assetId={asset.id} />
          ) : (
            <AssetDetailExpanded assetId={asset.id} />
          )
        }
        renderOverride={(asset) =>
          // TODO rug check
          asset.id === "10" ? <InvalidAssetRow assetId={asset.id} /> : undefined
        }
      />
    </TableContainer>
  )
}
