import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import React from "react"
import { useTranslation } from "react-i18next"

import { OmnipoolDepositFull, XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetPrice } from "@/components/AssetPrice"
import { scaleHuman } from "@/utils/formatting"

import {
  useFormatRewards,
  useTotalRewardsToReceive,
} from "./RemoveLiquidity.utils"

export type TReceiveAsset = {
  asset: TAssetData
  value: string
}

export const ReceiveAssets = ({
  assets,
  title,
  positions,
}: {
  assets: TReceiveAsset[]
  title?: string
  positions?: Array<XykDeposit | OmnipoolDepositFull>
}) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { value: rewards } = useTotalRewardsToReceive(positions ?? [])
  const formattedRewards = useFormatRewards(rewards)

  return (
    <>
      <Text color={getToken("text.tint.secondary")} font="primary" fw={700}>
        {title ?? t("minimumReceive")}
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
        {!!positions?.length && formattedRewards !== "0" && (
          <>
            <Separator />
            <Flex align="center" justify="space-between">
              <Text fs={12}>
                {t("liquidity:liquidity.remove.modal.rewardsToReceive")}
              </Text>
              <Text fs="p4" color={getToken("accents.success.emphasis")}>
                {formattedRewards}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
    </>
  )
}

const RecieveAsset = ({ asset }: { asset: TReceiveAsset }) => {
  const { t } = useTranslation("common")

  return (
    <Flex gap={12} justify="space-between" align="center">
      <AssetLabelFull asset={asset.asset} withName={false} />

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
