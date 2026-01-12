import {
  Hourglass,
  Landmark,
  Layers,
  LockOpen,
  Vote,
} from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useUserBorrowSummary } from "@/api/borrow"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import {
  useNativeAssetLocks,
  useUnlockableNativeTokens,
} from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow.data"
import { FullExpiration } from "@/modules/wallet/assets/MyAssets/FullExpiration"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailNativeMobileModalBalances: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { native } = useAssets()

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInDemocracy)

  const { data: borrow } = useUserBorrowSummary()

  const underlyingNativeAsset = getAddressFromAssetId(native.id)
  const borrowedBigint =
    borrow?.userReservesData.find(
      (reserve) => reserve.underlyingAsset === underlyingNativeAsset,
    )?.totalBorrows ?? "0"
  const borrowed = scaleHuman(borrowedBigint, native.decimals)
  const [borrowedDisplay] = useDisplayAssetPrice(asset.id, borrowed)

  // TODO integrate
  const xcm = "-1"
  const [xcmDisplay] = useDisplayAssetPrice(asset.id, xcm)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.transferrable")}
        value={t("common:number", {
          value: asset.transferable,
        })}
        displayValue={asset.transferableDisplay}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.borrowed")}
        value={t("common:number", {
          value: borrowed,
        })}
        displayValue={borrowedDisplay}
      />
      <SAssetDetailMobileSeparator />
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
          <SAssetDetailMobileSeparator />
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
      <SAssetDetailMobileSeparator />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInStaking")}
        labelIcon={Layers}
        value={t("common:number", {
          value: locks.lockedInStaking,
        })}
        displayValue={locks.lockedInStakingDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
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
      <SAssetDetailMobileSeparator />
      <Flex direction="column" gap={getTokenPx("scales.paddings.m")}>
        <Amount
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
          <SAssetDetailMobileSeparator />
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
          <SAssetDetailMobileSeparator />
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
    </>
  )
}
