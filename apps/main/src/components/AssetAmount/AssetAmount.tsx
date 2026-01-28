import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: TAsset
  readonly amount: bigint | string | number
}

export const AssetAmount: FC<Props> = ({ asset, amount }) => {
  const { t } = useTranslation()
  const { isBond } = useAssets()

  return (
    <Flex align="center" p="s">
      <AssetLogo id={asset.id} />
      <Text
        fw={500}
        fs="p4"
        lh="xs"
        py="s"
        pl="s"
        color={getToken("text.high")}
      >
        {t("currency", {
          value: scaleHuman(amount, asset.decimals),
          symbol: asset.symbol,
        })}{" "}
        {isBond(asset) && asset.name.replace("HDX Bond ", "").slice(3)}
      </Text>
    </Flex>
  )
}
