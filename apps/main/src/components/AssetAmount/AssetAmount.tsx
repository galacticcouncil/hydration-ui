import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
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
    <Flex align="center" p={4}>
      <AssetLogo id={asset.id} />
      <Text
        fw={500}
        fs="p4"
        lh={px(13)}
        py={5}
        pl={4}
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
