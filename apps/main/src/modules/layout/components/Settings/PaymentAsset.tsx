import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
  Skeleton,
  Spinner,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { Logo } from "@/components/Logo"
import { useAssets } from "@/providers/assetsProvider"

type PaymentAssetProps = {
  onClick?: () => void
}

export const PaymentAsset: FC<PaymentAssetProps> = ({ onClick }) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const { data: id, isLoading } = useAccountFeePaymentAssetId()
  const asset = getAsset(id?.toString() ?? "")

  return (
    <MenuSelectionItem onClick={onClick}>
      {!isLoading && asset ? (
        <>
          <MenuItemIcon component={() => <Logo id={asset.id} />} />
          <MenuItemLabel>{t("paymentAsset")}</MenuItemLabel>
          <MenuItemDescription>{asset.symbol}</MenuItemDescription>
        </>
      ) : (
        <>
          <MenuItemIcon component={Spinner} />
          <MenuItemLabel>{t("paymentAsset")}</MenuItemLabel>
          <MenuItemDescription>
            <Skeleton width={50} />
          </MenuItemDescription>
        </>
      )}
      <MenuSelectionItemArrow />
    </MenuSelectionItem>
  )
}
