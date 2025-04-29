import { Button, ModalFooter } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetWithdrawForm } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm"
import { useWithdrawAsset } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.submit"
import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"
import { AssetWithdrawModalHeader } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawModalHeader"

type Props = {
  readonly onBack: () => void
  readonly onAccountSelect: () => void
}

export const AssetWithdrawModal: FC<Props> = ({ onBack, onAccountSelect }) => {
  const { t } = useTranslation(["wallet", "common"])
  const form = useFormContext<AssetWithdrawFormValues>()
  const withdrawAsset = useWithdrawAsset()

  return (
    <FormProvider {...form}>
      <AssetWithdrawModalHeader onBack={onBack} />
      <AssetWithdrawForm onAccountSelect={onAccountSelect} />
      <ModalFooter>
        <Button
          sx={{ width: "100%" }}
          size="large"
          onClick={form.handleSubmit(withdrawAsset)}
        >
          {t("withdraw.asset.cta")}
        </Button>
      </ModalFooter>
    </FormProvider>
  )
}
