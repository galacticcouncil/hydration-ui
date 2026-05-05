import {
  CoinsIcon,
  Hourglass,
  Landmark,
  Layers,
  LockOpen,
} from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TokenReserveType, useAccountTokenReserves } from "@/api/balances"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import {
  useNativeAssetLocks,
  useUnlockableNativeTokens,
} from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow.data"
import { ExpandedRowSeparator } from "@/modules/wallet/assets/MyAssets/ExpandedRowSeparator"
import { FullExpiration } from "@/modules/wallet/assets/MyAssets/FullExpiration"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: MyAsset
}

export const ExpandedNativeRow: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const locks = useNativeAssetLocks()
  const unlockable = useUnlockableNativeTokens(locks.lockedInOpenGov)
  const { data: reserves } = useAccountTokenReserves(asset.id)
  const xcm = reserves?.get(TokenReserveType.XCM) ?? 0n
  const { price: assetPrice } = useAssetPrice(asset.id)

  const dca = reserves?.get(TokenReserveType.DCA) ?? 0n
  const otc = reserves?.get(TokenReserveType.OTC) ?? 0n
  const xcmAmountHuman = scaleHuman(xcm, asset.decimals)
  const dcaAmountHuman = scaleHuman(dca, asset.decimals)
  const otcAmountHuman = scaleHuman(otc, asset.decimals)

  return (
    <Flex direction="column" gap="xl">
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
          <ExpandedRowSeparator />
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
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInXCM")}
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
      <ExpandedRowSeparator />
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
          <ExpandedRowSeparator />
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
      {Big(locks.lockedInDemocracy).gt(0) && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            value={t("common:number", {
              value: locks.lockedInDemocracy,
            })}
            displayValue={t("common:currency", {
              value: locks.lockedInDemocracyDisplay,
            })}
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
            displayValue={t("common:currency", {
              value: locks.lockedInOpenGovDisplay,
            })}
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
            displayValue={t("common:currency", {
              value: locks.lockedInVestingDisplay,
            })}
          />
        </>
      )}
    </Flex>
  )
}
