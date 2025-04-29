import {
  Amount,
  ExpandedTableRowHorizontalSeparator,
  Flex,
  Separator,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import {
  useNativeAssetLocks,
  useUnlockableNativeTokens,
} from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow.data"
import { FullExpiration } from "@/modules/wallet/assets/MyAssets/FullExpiration"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"

type Props = {
  readonly asset: MyAsset
}

export const ExpandedNativeRow: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInDemocracy)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  return (
    <Flex direction="column" gap={20}>
      <Flex px={50} justify="space-around">
        <Amount
          // separators with size auto are not shown when flexbox has align
          sx={{ alignSelf: "center" }}
          label={t("myAssets.expandedNative.lockedInStaking")}
          value={t("common:number", {
            value: locks.lockedInStaking,
          })}
          displayValue={locks.lockedInStakingDisplayPrice}
        />
        <Separator orientation="vertical" />
        <Flex
          direction="column"
          gap={8}
          // separators with size auto are not shown when flexbox has align
          sx={{ alignSelf: "center" }}
        >
          <Amount
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            value={t("common:number", {
              value: locks.lockedInDemocracy,
            })}
            displayValue={locks.lockedInDemocracyDisplayPrice}
          />
          {unlockable.lockedSeconds > 0 && (
            <FullExpiration initialLockedSeconds={unlockable.lockedSeconds} />
          )}
        </Flex>
        <Separator orientation="vertical" />
        <Flex
          gap={20}
          align="center"
          // separators with size auto are not shown when flexbox has align
          sx={{ alignSelf: "center" }}
        >
          <Flex direction="column" gap={8}>
            <Amount
              label={t("myAssets.expandedNative.unlockable")}
              value={t("common:number", {
                value: unlockable.value,
              })}
              displayValue={unlockable.displayValue}
            />
            {unlockable.unlockableIds.length > 0 && (
              <LockExpiration>
                {t("myAssets.expandedNative.expiredLocks", {
                  amount: unlockable.unlockableIds.length,
                })}
              </LockExpiration>
            )}
          </Flex>
          <AssetDetailUnlock
            unlockableIds={unlockable.unlockableIds}
            value={unlockable.value}
          />
        </Flex>
      </Flex>
      <ExpandedTableRowHorizontalSeparator />
      <Flex px={50} justify="space-around">
        <Amount
          label={t("myAssets.expandedNative.lockedInReferenda")}
          value={t("common:number", {
            value: locks.lockedInOpenGov,
          })}
          displayValue={locks.lockedInOpenGovDisplayPrice}
        />
        <Separator orientation="vertical" />
        <Amount
          label={t("myAssets.expandedNative.reserved")}
          value={t("common:number", {
            value: asset.reserved,
          })}
          displayValue={reservedDisplayPrice}
        />
        {new Big(locks.lockedInVesting).gt(0) && (
          <>
            <Separator orientation="vertical" />
            <Amount
              label={t("myAssets.expandedNative.lockedInVesting")}
              value={t("common:number", {
                value: locks.lockedInVesting,
              })}
              displayValue={locks.lockedInVestingDisplayPrice}
            />
          </>
        )}
      </Flex>
    </Flex>
  )
}
