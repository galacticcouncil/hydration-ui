import {
  Grid,
  GridProps,
  VirtualizedList,
} from "@galacticcouncil/ui/components"

import { CexAssetSelectRow } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelectRow"
import {
  CEX_ROW_HEIGHT,
  CexSelectRow,
} from "@/modules/onramp/components/CexAssetSelect/CexSelectRow"
import { CEX_CONFIG, getCexConfigById } from "@/modules/onramp/config/cex"
import { AssetConfig } from "@/modules/onramp/types"

const ASSET_ROW_HEIGHT = 60
const MAX_VISIBLE = 10

export type CexAssetSelectProps = GridProps & {
  activeCexId: string
  onAssetSelect: (asset: AssetConfig) => void
  onCexSelect: (id: string) => void
}

export const CexAssetSelect: React.FC<CexAssetSelectProps> = ({
  activeCexId,
  onCexSelect,
  onAssetSelect,
  ...props
}) => {
  const cex = getCexConfigById(activeCexId)

  if (!cex) return null

  return (
    <Grid
      columnTemplate={["9rem 1fr", "10.25rem 1fr"]}
      gap={["base", "l"]}
      {...props}
    >
      <VirtualizedList
        items={CEX_CONFIG}
        maxVisibleItems={MAX_VISIBLE}
        itemSize={CEX_ROW_HEIGHT}
        sx={{ minHeight: CEX_ROW_HEIGHT * MAX_VISIBLE, p: "s" }}
        renderItem={(cex, { key }) => (
          <CexSelectRow
            key={key}
            title={cex.title}
            logo={cex.logo}
            isActive={cex.id === activeCexId}
            onClick={() => onCexSelect(cex.id)}
          />
        )}
      />
      <VirtualizedList
        items={cex.assets}
        maxVisibleItems={MAX_VISIBLE}
        sx={{ minHeight: ASSET_ROW_HEIGHT * 3 }}
        itemSize={ASSET_ROW_HEIGHT}
        separated
        renderItem={(item, { key }) => (
          <CexAssetSelectRow
            key={key}
            onClick={() => onAssetSelect(item)}
            assetId={item.assetId}
          />
        )}
      />
    </Grid>
  )
}
