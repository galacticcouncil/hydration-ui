import {
  Hourglass,
  Landmark,
  Layers,
  LockOpen,
  Vote,
} from "@galacticcouncil/ui/assets/icons"
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
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"

type Props = {
  readonly asset: MyAsset
}

export const ExpandedNativeRow: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInDemocracy)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  // TODO integrate
  const xcm = "-1"
  const [xcmDisplay] = useDisplayAssetPrice(asset.id, xcm)

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
      {xcm !== "-1" && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInXCM")}
            labelIcon={Hourglass}
            description={t("myAssets.expandedNative.lockedInXCM.description", {
              returnObjects: true,
            })}
            value={t("common:number", {
              value: xcm,
            })}
            displayValue={xcmDisplay}
          />
        </>
      )}
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
      <ExpandedRowSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDemocracy")}
        labelIcon={Vote}
        value={t("common:number", {
          value: locks.lockedInDemocracy,
        })}
        displayValue={locks.lockedInDemocracyDisplayPrice}
        descriptionCustom={
          unlockable.lockedSeconds > 0 && (
            <FullExpiration
              sx={{ width: "fit-content" }}
              initialLockedSeconds={unlockable.lockedSeconds}
            />
          )
        }
      />
      <ExpandedRowSeparator />
      <Flex align="center" gap="m">
        <Amount
          css={{ flex: 1 }}
          variant="horizontalLabel"
          color="tint"
          label={t("myAssets.expandedNative.unlockableInDemocracy")}
          labelIcon={LockOpen}
          value={t("common:number", {
            value: unlockable.value,
          })}
          displayValue={unlockable.displayValue}
          descriptionCustom={
            unlockable.unlockableIds.length > 0 && (
              <LockExpiration
                sx={{
                  width: "fit-content",
                }}
              >
                {t("myAssets.expandedNative.expiredLocks", {
                  amount: unlockable.unlockableIds.length,
                })}
              </LockExpiration>
            )
          }
        />
        <AssetDetailUnlock
          unlockableIds={unlockable.unlockableIds}
          value={unlockable.value}
        />
      </Flex>
      {new Big(locks.lockedInOpenGov).gt(0) && (
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
