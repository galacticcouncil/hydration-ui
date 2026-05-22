import { Amount, Button, ModalHeader } from "@galacticcouncil/ui/components"
import { differenceInMilliseconds } from "date-fns"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { AssetLabelFull } from "@/components/AssetLabelFull"
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
  const { data: bestNumber } = useBestNumber()

  const timeLeft =
    bond.maturity && bestNumber
      ? differenceInMilliseconds(bond.maturity, bestNumber.timestamp)
      : 0

  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={bond.symbol}
        customTitle={<AssetLabelFull asset={bond} size="primary" />}
      />
      <SAssetDetailModalBody>
        <Amount
          variant="primary"
          label={t("myBonds.header.total")}
          value={t("common:number", {
            value: bond.total,
          })}
          displayValue={bond.totalDisplay}
        />
        <SAssetDetailMobileSeparator />
        <Amount
          variant="horizontalLabel"
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
          <Button size="large" disabled>
            {t("myBonds.actions.redeem")}
          </Button>
          <Button variant="secondary" size="large" onClick={onTransfer}>
            {t("common:send")}
          </Button>
        </SAssetDetailMobileActions>
      </SAssetDetailModalBody>
    </>
  )
}
