import { Amount, Grid } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal.styled"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
}

export const AssetDetailMobileModalBalances: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation(["wallet", "common"])

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const balance = 2855.24566
  const [balanceDisplayPrice] = useDisplayAssetPrice(asset.id, balance)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.transferableAmount")}
        value={t("common:number", {
          value: balance,
        })}
        displayValue={balanceDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.borrowedAmount")}
        value={t("common:number", {
          value: balance,
        })}
        displayValue={balanceDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInStaking")}
        value={t("common:number", {
          value: balance,
        })}
        displayValue={balanceDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Grid
        sx={{
          gridTemplateRows: "auto auto",
          gridTemplateColumns: "1fr auto",
          "& > :nth-child(1)": { gridColumn: "1/-1" },
          "& > :nth-child(2)": { gridColumn: 2 },
        }}
        rowGap={8}
      >
        <Amount
          variant="horizontalLabel"
          label={t("myAssets.expandedNative.unlockable")}
          value={t("common:number", {
            value: balance,
          })}
          displayValue={balanceDisplayPrice}
        />
        <AssetDetailUnlock />
      </Grid>
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDemocracy")}
        value={t("common:number", {
          value: balance,
        })}
        displayValue={balanceDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInVesting")}
        value={t("common:number", {
          value: balance,
        })}
        displayValue={balanceDisplayPrice}
      />
    </>
  )
}
