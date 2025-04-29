import { ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"

type Props = {
  readonly onBack: () => void
}

export const AssetWithdrawModalHeader: FC<Props> = ({ onBack }) => {
  const { t } = useTranslation("wallet")
  const form = useFormContext<AssetWithdrawFormValues>()
  const chain = form.watch("chain")

  return (
    <ModalHeader
      title={t("withdraw.asset.title", { chain })}
      align="center"
      onBack={onBack}
    />
  )
}
