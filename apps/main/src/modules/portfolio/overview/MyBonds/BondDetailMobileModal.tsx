import { Amount, Button, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { BondRedeemButton } from "@/components/BondRedeemButton"
import { SAssetDetailMobileActions } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileActions.styled"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { MyBond } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"

type Props = {
  readonly bond: MyBond
  readonly onTransfer: () => void
}

export const BondDetailMobileModal: FC<Props> = ({ bond, onTransfer }) => {
  const { t } = useTranslation(["wallet", "common"])

  const { timeLeft: liveTimeLeft } = useBondData(bond.id)
  const timeLeft = bond.isPreview
    ? Math.max(0, bond.maturity - Date.now())
    : liveTimeLeft

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
              ? t("common:interval.remaining", {
                  value: timeLeft,
                  largest: 1,
                })
              : undefined
          }
        />
        <SAssetDetailMobileActions>
          <Button
            variant="primary"
            size="large"
            disabled={bond.isPreview}
            onClick={onTransfer}
          >
            {t("common:send")}
          </Button>
          {bond.isPreview ? (
            <Button size="large" disabled>
              {t("common:redeem")}
            </Button>
          ) : (
            <BondRedeemButton size="large" bondId={bond.id} />
          )}
        </SAssetDetailMobileActions>
      </SAssetDetailModalBody>
    </>
  )
}
