import { Hourglass, Landmark } from "@galacticcouncil/ui/assets/icons"
import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly reserved: string
  readonly reservedDca: string | undefined
}

export const AssetDetailMobileModalBalances: FC<Props> = ({
  assetId,
  reserved,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, reserved)

  // TODO integrate
  const xcm = "-1"
  const [xcmDisplay] = useDisplayAssetPrice(asset.id, xcm)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDCA")}
        labelIcon={Landmark}
        value={t("common:number", {
          value: reserved,
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
    </>
  )
}
