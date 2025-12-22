import { Button } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions.styled"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onModalOpen: (action: AssetDetailModal) => void
}

export const AssetDetailMobileActions: FC<Props> = ({ asset, onModalOpen }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <SAssetDetailMobileActions>
      {/* TODO integrate later with deposit and withdraw functionality */}
      {/* <Button size="large" onClick={() => onModalOpen("deposit")}>
        {t("deposit")}
      </Button>
      <Button
        variant="tertiary"
        size="large"
        onClick={() => onModalOpen("withdraw")}
      >
        {t("withdraw")}
      </Button> */}
      <Button
        variant="tertiary"
        size="large"
        disabled={!asset.isTradable}
        onClick={() =>
          navigate({
            to: "/trade/swap/market",
            search: { assetOut: asset.id },
          })
        }
      >
        {t("trade")}
      </Button>
      <Button
        variant="tertiary"
        size="large"
        onClick={() => onModalOpen("transfer")}
      >
        {t("transfer")}
      </Button>
    </SAssetDetailMobileActions>
  )
}
