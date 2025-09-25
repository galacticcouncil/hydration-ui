import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import React from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetPrice } from "@/components/AssetPrice"
import { scaleHuman } from "@/utils/formatting"

export type TReceiveAsset = {
  asset: TAssetData
  value: string
}

export const RecieveAssets = ({ assets }: { assets: TReceiveAsset[] }) => {
  const { t } = useTranslation("common")

  return (
    <>
      <Text color={getToken("text.tint.secondary")} font="primary" fw={700}>
        {t("minimumReceive")}
      </Text>
      <Flex
        direction="column"
        gap={12}
        p={getTokenPx("containers.paddings.tertiary")}
        sx={{
          borderRadius: getTokenPx("containers.cornerRadius.internalPrimary"),
          backgroundColor: getToken("surfaces.containers.dim.dimOnHigh"),
        }}
      >
        {assets.map((asset, index) => (
          <React.Fragment key={asset.asset.id}>
            <RecieveAsset asset={asset} />
            {index < assets.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </Flex>
    </>
  )
}

const RecieveAsset = ({ asset }: { asset: TReceiveAsset }) => {
  const { t } = useTranslation("common")

  return (
    <Flex gap={12} justify="space-between" align="center">
      <AssetLabelFull asset={asset.asset} withName={false} size="large" />

      <Flex direction="column" align="flex-end">
        <Text fw={600} color={getToken("text.high")} fs="p2" lh={1}>
          {t("number", {
            value: scaleHuman(asset.value, asset.asset.decimals),
          })}
        </Text>
        <AssetPrice
          assetId={asset.asset.id}
          value={Number(scaleHuman(asset.value, asset.asset.decimals))}
          wrapper={<Text color={getToken("text.low")} fs="p5" />}
        />
      </Flex>
    </Flex>
  )
}
