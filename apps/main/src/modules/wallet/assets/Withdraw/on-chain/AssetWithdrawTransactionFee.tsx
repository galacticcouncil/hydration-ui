import { HelpIcon } from "@galacticcouncil/ui/assets/icons"
import { TransactionListItemValue } from "@galacticcouncil/ui/components"
import { TransactionListItem } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"

export const AssetWithdrawTransactionFee: FC = () => {
  const { t } = useTranslation()
  const { watch } = useFormContext<AssetWithdrawFormValues>()

  const [asset, amount] = watch(["asset", "amount"])
  const [transferFee] = useDisplayAssetPrice(asset?.id ?? "", amount)

  return (
    <TransactionListItem
      sx={{ display: "flex", alignItems: "center" }}
      label={t("transferFee")}
      customValue={
        <TransactionListItemValue>
          {transferFee}
          <HelpIcon />
        </TransactionListItemValue>
      }
    />
  )
}
