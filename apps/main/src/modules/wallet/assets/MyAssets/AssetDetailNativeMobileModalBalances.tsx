import {
  CoinsIcon,
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

import { TokenReserveType, useAccountTokenReserves } from "@/api/balances"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import {
  useNativeAssetLocks,
  useUnlockableNativeTokens,
} from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow.data"
import { FullExpiration } from "@/modules/wallet/assets/MyAssets/FullExpiration"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailNativeMobileModalBalances: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInOpenGov)
  const { data: reserves } = useAccountTokenReserves(asset.id)
  const dca = reserves?.get(TokenReserveType.DCA) ?? 0n
  const otc = reserves?.get(TokenReserveType.OTC) ?? 0n
  const xcm = reserves?.get(TokenReserveType.XCM) ?? 0n
  const dcaAmountHuman = scaleHuman(dca, asset.decimals)
  const otcAmountHuman = scaleHuman(otc, asset.decimals)
  const xcmAmountHuman = scaleHuman(xcm, asset.decimals)
  const { price: assetPrice } = useAssetPrice(asset.id)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.transferrable")}
        value={t("common:number", {
          value: asset.transferable,
        })}
        displayValue={t("common:currency", {
          value: asset.transferableDisplay,
        })}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDCA")}
        labelIcon={Landmark}
        value={t("common:number", {
          value: dcaAmountHuman,
        })}
        displayValue={t("common:currency", {
          value: Big(dcaAmountHuman).times(assetPrice).toString(),
        })}
      />
      {otc > 0n && (
        <>
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInOTC")}
            labelIcon={CoinsIcon}
            value={t("common:number", {
              value: otcAmountHuman,
            })}
            displayValue={t("common:currency", {
              value: Big(otcAmountHuman).times(assetPrice).toString(),
            })}
          />
        </>
      )}
      {xcm > 0n && (
        <>
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInXCM")}
            description={t("myAssets.expandedNative.lockedInXCM.description")}
            labelIcon={Hourglass}
            value={t("common:number", {
              value: xcmAmountHuman,
            })}
            displayValue={t("common:currency", {
              value: Big(xcmAmountHuman).times(assetPrice).toString(),
            })}
          />
        </>
      )}
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInStaking")}
        labelIcon={Layers}
        value={t("common:number", {
          value: locks.lockedInStaking,
        })}
        displayValue={t("common:currency", {
          value: locks.lockedInStakingDisplay,
        })}
      />
      {new Big(locks.lockedInGigaStaking).gt(0) && (
        <>
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInGigaStaking")}
            value={t("common:number", {
              value: locks.lockedInGigaStaking,
            })}
            displayValue={t("common:currency", {
              value: locks.lockedInGigaStakingDisplay,
            })}
          />
        </>
      )}
      {new Big(locks.lockedInDemocracy).gt(0) && (
        <>
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            labelIcon={Vote}
            value={t("common:number", {
              value: locks.lockedInDemocracy,
            })}
            displayValue={t("common:currency", {
              value: locks.lockedInDemocracyDisplay,
            })}
            descriptionCustom={
              unlockable.lockedSeconds > 0 && (
                <FullExpiration
                  sx={{ width: "fit-content" }}
                  initialLockedSeconds={unlockable.lockedSeconds}
                />
              )
            }
          />
        </>
      )}

      {new Big(locks.lockedInOpenGov).gt(0) && (
        <>
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInReferenda")}
            value={t("common:number", {
              value: locks.lockedInOpenGov,
            })}
            displayValue={t("common:currency", {
              value: locks.lockedInOpenGovDisplay,
            })}
          />
        </>
      )}
      <SAssetDetailMobileSeparator />
      <Flex direction="column" gap="m">
        <Amount
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
              <FullExpiration
                sx={{ width: "fit-content" }}
                initialLockedSeconds={unlockable.lockedSeconds}
              />
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
          <SAssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInVesting")}
            value={t("common:number", {
              value: locks.lockedInVesting,
            })}
            displayValue={t("common:currency", {
              value: locks.lockedInVestingDisplay,
            })}
          />
        </>
      )}
    </>
  )
}
