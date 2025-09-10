import { Flex, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly assetId?: string | null
  readonly amount: string
}

export const LiquidationCallDescription: FC<Props> = ({ assetId, amount }) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId ?? "")

  return (
    <Flex
      gap={8}
      align="center"
      justify={["end", "start"]}
      sx={{ flexWrap: "wrap", whiteSpace: "collapse" }}
    >
      <Text fs={14} sx={{ textAlign: ["right", "left"] }}>
        {t("borrow:history.table.liquidatedCollateral")}
      </Text>
      <Flex align="center" gap={8}>
        {assetId && <AssetLogo size="small" id={assetId} />}
        <Text fs={14}>
          {t("currency", {
            value: scaleHuman(amount, asset.decimals),
            symbol: asset.symbol,
          })}
        </Text>
      </Flex>
    </Flex>
  )
}
