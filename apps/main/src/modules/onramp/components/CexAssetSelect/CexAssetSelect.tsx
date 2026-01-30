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
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { AssetConfig } from "@/modules/onramp/types"

const ASSET_ROW_HEIGHT = 60

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
  const cex = CEX_CONFIG.find(({ id }) => id === activeCexId)

  if (!cex) return null

  return (
    <Grid columnTemplate={["64px 1fr", "180px 1fr"]} {...props}>
      <VirtualizedList
        items={CEX_CONFIG}
        maxVisibleItems={10}
        itemSize={CEX_ROW_HEIGHT}
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
        maxVisibleItems={10}
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
