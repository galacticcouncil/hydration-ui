import { useTranslation } from "react-i18next"

import { AnyChain } from "@galacticcouncil/xcm-core"
import { ExternalAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { getChainId } from "utils/xcm"

export type TransferAmountColumnProps = {
  asset: string
  amount: string
  assetSymbol: string
  chain: AnyChain
}

export const TransferAmountColumn: React.FC<TransferAmountColumnProps> = ({
  asset,
  assetSymbol,
  chain,
  amount,
}) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", gap: 8, align: "center" }}>
      <Icon
        size={24}
        icon={
          <ExternalAssetLogo
            id={asset}
            chainId={getChainId(chain).toString()}
            ecosystem={chain.ecosystem}
          />
        }
      />
      {t("value.tokenWithSymbol", {
        value: amount,
        symbol: assetSymbol,
      })}
    </div>
  )
}
