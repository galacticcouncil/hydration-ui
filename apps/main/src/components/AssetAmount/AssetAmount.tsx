import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: TAsset
  readonly amount?: bigint | string | number
}

export const AssetAmount: FC<Props> = ({ asset, amount }) => {
  const { t } = useTranslation()
  const { isBond } = useAssets()

  return (
    <Flex align="center" gap="s">
      <AssetLogo id={asset.id} />
      <Text
        fw={500}
        fs="p4"
        lh="xs"
        py="s"
        pl="s"
        color={getToken("text.high")}
      >
        {amount === undefined
          ? asset.symbol
          : t("currency", {
              value: scaleHuman(amount, asset.decimals),
              symbol: asset.symbol,
            })}{" "}
        {isBond(asset) && (
          <Text
            display="block"
            as="span"
            fs="p5"
            lh={1.4}
            color={getToken("text.low")}
          >
            {asset.name}
          </Text>
        )}
      </Text>
    </Flex>
  )
}
