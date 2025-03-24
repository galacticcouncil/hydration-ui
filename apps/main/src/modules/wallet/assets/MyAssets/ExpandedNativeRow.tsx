import {
  Amount,
  ExpandedTableRowHorizontalSeparator,
  Flex,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"

type Props = {
  readonly assetId: string
}

export const ExpandedNativeRow: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation(["wallet", "common"])

  const lockedInStaking = 2855
  const [lockedInStakingDisplayPrice] = useDisplayAssetPrice(
    assetId,
    lockedInStaking,
  )

  const lockedInDemocracy = 2855
  const [lockedInDemocracyDisplayPrice] = useDisplayAssetPrice(
    assetId,
    lockedInDemocracy,
  )
  const fullExpiration = "7 days 7 hrs"

  const unlockable = 2855
  const [unlockableDisplayPrice] = useDisplayAssetPrice(assetId, unlockable)
  const expiredLocks = 3

  const reserved = 2855
  const [reservedDisplayPrice] = useDisplayAssetPrice(assetId, reserved)

  const lockedInVesting = 2855
  const [lockedInVestingDisplayPrice] = useDisplayAssetPrice(
    assetId,
    lockedInVesting,
  )

  return (
    <Flex direction="column" gap={20}>
      <Flex px={50} justify="space-around">
        <Amount
          label={t("myAssets.expandedNative.lockedInStaking")}
          value={t("common:number", {
            value: lockedInStaking,
          })}
          displayValue={lockedInStakingDisplayPrice}
          // align on flexbox does not work with separators with height auto
          sx={{ alignSelf: "center" }}
        />
        <Separator orientation="vertical" />
        <Flex direction="column" gap={8}>
          <Amount
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            value={t("common:number", {
              value: lockedInDemocracy,
            })}
            displayValue={lockedInDemocracyDisplayPrice}
          />
          <LockExpiration>
            {t("myAssets.expandedNative.fullExpiration", {
              relativeTime: fullExpiration,
            })}
          </LockExpiration>
        </Flex>
        <Separator orientation="vertical" />
        <Flex gap={20} align="center">
          <Flex direction="column" gap={8}>
            <Amount
              label={t("myAssets.expandedNative.unlockable")}
              value={t("common:number", {
                value: unlockable,
              })}
              displayValue={unlockableDisplayPrice}
            />
            <LockExpiration>
              {t("myAssets.expandedNative.expiredLocks", {
                amount: expiredLocks,
              })}
            </LockExpiration>
          </Flex>
          <AssetDetailUnlock />
        </Flex>
      </Flex>
      <ExpandedTableRowHorizontalSeparator />
      <Flex px={50} justify="space-around">
        <Amount
          label={t("myAssets.expandedNative.reserved")}
          value={t("common:number", {
            value: reserved,
          })}
          displayValue={reservedDisplayPrice}
        />
        <Separator orientation="vertical" />
        <Amount
          label={t("myAssets.expandedNative.lockedInVesting")}
          value={t("common:number", {
            value: lockedInVesting,
          })}
          displayValue={lockedInVestingDisplayPrice}
        />
      </Flex>
    </Flex>
  )
}
