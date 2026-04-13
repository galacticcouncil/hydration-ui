import { Landmark, Layers, LockOpen } from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import {
  useNativeAssetLocks,
  useUnlockableNativeTokens,
} from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow.data"
import { ExpandedRowSeparator } from "@/modules/wallet/assets/MyAssets/ExpandedRowSeparator"
import { FullExpiration } from "@/modules/wallet/assets/MyAssets/FullExpiration"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
}

export const ExpandedNativeRow: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInOpenGov)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  return (
    <Flex direction="column" gap="xl">
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDCA")}
        labelIcon={Landmark}
        value={t("common:number", {
          value: asset.reserved,
        })}
        displayValue={reservedDisplayPrice}
      />
      <ExpandedRowSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInStaking")}
        labelIcon={Layers}
        value={t("common:number", {
          value: locks.lockedInStaking,
        })}
        displayValue={locks.lockedInStakingDisplayPrice}
      />
      {Big(locks.lockedInDemocracy).gt(0) && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            value={t("common:number", {
              value: locks.lockedInDemocracy,
            })}
            displayValue={locks.lockedInDemocracyDisplayPrice}
          />
        </>
      )}
      {Big(locks.lockedInOpenGov).gt(0) && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInReferenda")}
            value={t("common:number", {
              value: locks.lockedInOpenGov,
            })}
            displayValue={locks.lockedInOpenGovDisplayPrice}
          />
        </>
      )}
      <ExpandedRowSeparator />

      <Flex align="center" gap="m">
        <Amount
          css={{ flex: 1 }}
          variant="horizontalLabel"
          color="tint"
          label={t("myAssets.expandedNative.unlockable")}
          labelIcon={LockOpen}
          value={t("common:number", {
            value: unlockable.value,
          })}
          displayValue={unlockable.displayValue}
          descriptionCustom={
            unlockable.lockedSeconds > 0 && (
              <FullExpiration initialLockedSeconds={unlockable.lockedSeconds} />
            )
          }
        />
        <AssetDetailUnlock
          votesToRemove={unlockable.votesToRemove}
          classIds={unlockable.classIds}
          value={unlockable.value}
        />
      </Flex>

      {new Big(locks.lockedInVesting).gt(0) && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInVesting")}
            value={t("common:number", {
              value: locks.lockedInVesting,
            })}
            displayValue={locks.lockedInVestingDisplayPrice}
          />
        </>
      )}
    </Flex>
  )
}
