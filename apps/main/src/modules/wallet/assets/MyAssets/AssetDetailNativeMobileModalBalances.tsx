import { Amount, Grid } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailNativeMobileModalBalances: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInDemocracy)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInStaking")}
        value={t("common:number", {
          value: locks.lockedInStaking,
        })}
        displayValue={locks.lockedInStakingDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Grid
        sx={{
          gridTemplateRows: "auto auto",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
        }}
        rowGap={8}
      >
        <Amount
          sx={{ gridColumn: "1/-1" }}
          variant="horizontalLabel"
          label={t("myAssets.expandedNative.lockedInDemocracy")}
          value={t("common:number", {
            value: locks.lockedInDemocracy,
          })}
          displayValue={locks.lockedInDemocracyDisplayPrice}
        />
        {unlockable.lockedSeconds > 0 && (
          <FullExpiration
            sx={{ gridColumn: 1, width: "fit-content" }}
            initialLockedSeconds={unlockable.lockedSeconds}
          />
        )}
      </Grid>
      <SAssetDetailMobileSeparator />
      <Grid
        sx={{
          gridTemplateRows: "auto auto auto",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
        }}
        rowGap={8}
      >
        <Amount
          sx={{ gridColumn: "1/-1" }}
          variant="horizontalLabel"
          label={t("myAssets.expandedNative.unlockable")}
          value={t("common:number", {
            value: unlockable.value,
          })}
          displayValue={unlockable.displayValue}
        />
        {unlockable.unlockableIds.length > 0 && (
          <LockExpiration
            sx={{ gridColumn: 1, width: "fit-content", height: "fit-content" }}
          >
            {t("myAssets.expandedNative.expiredLocks", {
              amount: unlockable.unlockableIds.length,
            })}
          </LockExpiration>
        )}
        <AssetDetailUnlock
          sx={{ gridColumn: 2 }}
          unlockableIds={unlockable.unlockableIds}
          value={unlockable.value}
        />
      </Grid>
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInReferenda")}
        value={t("common:number", {
          value: locks.lockedInOpenGov,
        })}
        displayValue={locks.lockedInOpenGovDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.reserved")}
        value={t("common:number", {
          value: asset.reserved,
        })}
        displayValue={reservedDisplayPrice}
      />
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
