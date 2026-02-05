import {
  Amount,
  AssetLabel,
  Flex,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import React from "react"
import { useTranslation } from "react-i18next"

import { OmnipoolDepositFull, XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { isXYKPoolMeta, XYKPoolMeta } from "@/providers/assetsProvider"

import {
  useFormatRewards,
  useTotalRewardsToReceive,
} from "./RemoveLiquidity.utils"

type AssetToRemove = {
  asset: TAssetData | XYKPoolMeta
  value: string
  displayValue: string
}

export const AmountToRemove = ({
  assets,
  positions,
}: {
  assets: AssetToRemove[]
  positions?: Array<XykDeposit | OmnipoolDepositFull>
}) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { value: rewards } = useTotalRewardsToReceive(positions ?? [])

  const formattedRewards = useFormatRewards(rewards)

  return (
    <>
      <Text color={getToken("text.tint.secondary")} font="primary" fw={700}>
        {t("liquidity:liquidity.remove.modal.amountToRemove")}
      </Text>

      <Flex
        direction="column"
        gap="m"
        p="m"
        sx={{
          borderRadius: "m",
          backgroundColor: getToken("surfaces.containers.dim.dimOnHigh"),
        }}
      >
        {assets.map(({ asset, value, displayValue }, index) => (
          <React.Fragment key={asset.id}>
            <Flex align="center" justify="space-between">
              <Flex align="center" gap="s">
                <AssetLogo
                  id={isXYKPoolMeta(asset) ? asset.iconId : asset.id}
                />
                <AssetLabel symbol={asset.symbol} />
              </Flex>
              <Amount
                variant="horizontalLabel"
                value={t("number", {
                  value: value,
                })}
                displayValue={t("currency", { value: displayValue })}
              />
            </Flex>
            {index < assets.length - 1 && <Separator />}
          </React.Fragment>
        ))}

        {!!positions?.length && (
          <>
            <Separator />
            <Flex align="center" justify="space-between">
              <Text fs="p5">
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
