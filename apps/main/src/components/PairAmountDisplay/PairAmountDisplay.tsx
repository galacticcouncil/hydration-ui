import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset1Amount: string
  readonly asset1Id: string
  readonly asset2Amount: string
  readonly asset2Id: string
  readonly balance: number
}

export const PairAmountDisplay: FC<Props> = ({
  asset1Amount,
  asset1Id,
  asset2Amount,
  asset2Id,
  balance,
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()

  const asset1 = getAsset(asset1Id)
  const asset2 = getAsset(asset2Id)

  return (
    <Flex gap={2} direction="column">
      <Text fs={13} color={getToken("text.high")}>
        {t("number", {
          value: scaleHuman(asset1Amount, asset1?.decimals ?? 12),
        })}{" "}
        {asset1?.symbol} |{" "}
        {t("number", {
          value: scaleHuman(asset2Amount, asset2?.decimals ?? 12),
        })}{" "}
        {asset2?.symbol}
      </Text>
      <AssetPrice
        assetId="10"
        value={balance}
        wrapper={<Text fs={10} color={getToken("text.low")} />}
      />
    </Flex>
  )
}
