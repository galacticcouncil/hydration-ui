import React, { useMemo } from "react"
import { AssetSelect } from "sections/deposit/components/AssetSelect"
import { VerticalTabs } from "sections/deposit/components/VerticalTabs"
import {
  CEX_DEPOSIT_CONFIG,
  useDepositStore,
} from "sections/deposit/DepositPage.utils"
import { AssetConfig } from "sections/deposit/types"

type DepositCexSelectProps = {
  onAssetSelect: (asset: AssetConfig) => void
}

export const DepositCexSelect: React.FC<DepositCexSelectProps> = ({
  onAssetSelect,
}) => {
  const { setCexId, cexId } = useDepositStore()
  const items = useMemo(() => {
    return CEX_DEPOSIT_CONFIG.map(({ id, title, assets, icon }) => ({
      id,
      title,
      icon,
      onClick: setCexId,
      content: <AssetSelect assets={assets} onSelect={onAssetSelect} />,
    }))
  }, [onAssetSelect, setCexId])

  return <VerticalTabs title="Exchange:" value={cexId} items={items} />
}
