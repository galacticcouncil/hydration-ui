import { Flex, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly assetId: string | null | undefined
  readonly amount: string
}

export const AssetAmountDescription: FC<Props> = ({ assetId, amount }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId ?? "")

  return (
    <Flex
      gap="base"
      align="center"
      justify={["end", "start"]}
      sx={{ flexWrap: "wrap" }}
    >
      {assetId && <AssetLogo size="small" id={assetId} />}
      <Text fs="p3" css={{ whiteSpace: "nowrap" }}>
        {t("currency", {
          value: scaleHuman(amount, asset.decimals),
          symbol: asset.symbol,
        })}
      </Text>
    </Flex>
  )
}
