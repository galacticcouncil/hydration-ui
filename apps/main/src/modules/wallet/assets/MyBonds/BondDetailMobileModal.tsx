import { Amount, Button, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { BondRedeemButton } from "@/components/BondRedeemButton"
import { SAssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions.styled"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { MyBond } from "@/modules/wallet/assets/MyBonds/MyBondsTable.columns"

type Props = {
  readonly bond: MyBond
  readonly onTransfer: () => void
}

export const BondDetailMobileModal: FC<Props> = ({ bond, onTransfer }) => {
  const { t } = useTranslation(["wallet", "common"])

  const { timeLeft } = useBondData(bond.id)

  return (
    <>
      <ModalHeader
        title={bond.symbol}
        customTitle={<AssetLabelFull asset={bond} size="primary" />}
      />
      <SAssetDetailModalBody>
        <Amount
          label={t("myBonds.header.total")}
          value={t("common:number", {
            value: bond.total,
          })}
          displayValue={t("common:currency", {
            value: bond.totalDisplay,
          })}
        />
        <SAssetDetailMobileSeparator />
        <Amount
          label={t("myBonds.header.maturity")}
          value={t("common:date.date", {
            value: new Date(bond.maturity),
          })}
          displayValue={
            timeLeft > 0
              ? t("common:interval.daysLeft", {
                  value: timeLeft,
                })
              : undefined
          }
        />
        <SAssetDetailMobileActions>
          <Button variant="primary" size="large" onClick={onTransfer}>
            {t("common:send")}
          </Button>
          <BondRedeemButton size="large" bondId={bond.id} />
        </SAssetDetailMobileActions>
      </SAssetDetailModalBody>
    </>
  )
}
