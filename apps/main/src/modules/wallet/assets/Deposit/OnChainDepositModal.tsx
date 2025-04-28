import {
  AccountTile,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { FormValues } from "@/modules/wallet/assets/Deposit/form"

type Props = {
  readonly onConfirm: () => void
  readonly onBack: () => void
  readonly onCancel: () => void
}

export const OnChainDepositModal: FC<Props> = ({
  onConfirm,
  onBack,
  onCancel,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <>
      <ModalHeader
        title={t("deposit.onChain.form.title")}
        align="center"
        onBack={onBack}
      />
      <ModalBody>
        <AccountTile
          name="account-1"
          symbol="USDC"
          address="0x123"
          value="100"
        />
        <ModalContentDivider />
        <AssetSelectFormField<FormValues>
          assetFieldName="asset"
          amountFieldName="amount"
          label={t("common:to")}
          assets={[]}
        />
        <ModalContentDivider />
        <AccountTile
          name="account-2"
          symbol="USDT"
          address="0x456"
          value="200"
        />
      </ModalBody>
      <ModalFooter sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="secondary" size="large" onClick={onCancel}>
          {t("common:cancel")}
        </Button>
        <Button size="large" onClick={onConfirm}>
          {t("deposit.onChain.form.submit")}
        </Button>
      </ModalFooter>
    </>
  )
}
