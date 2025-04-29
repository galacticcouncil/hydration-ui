import {
  AccountTile,
  ErrorMessageBar,
  ModalBody,
  ModalContentDivider,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AddressFormField } from "@/form/AddressFormField"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { AssetWithdrawChain } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawChain"
import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"
import { AssetWithdrawTransactionFee } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawTransactionFee"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly onAccountSelect: () => void
}

export const AssetWithdrawForm: FC<Props> = ({ onAccountSelect }) => {
  const { tradable } = useAssets()
  const { t } = useTranslation(["wallet", "common"])

  return (
    <ModalBody>
      <AccountTile
        label={t("withdraw.selectAccount.accountLabel")}
        sx={{ cursor: "pointer" }}
        name="account-name"
        symbol="HDX"
        address="0x278b77bb127081cad7beca2d7b863c459a436dd6"
        value="$100.21"
        active
        onClick={onAccountSelect}
      />
      <ModalContentDivider sx={{ mt: 20 }} />
      <AssetSelectFormField<AssetWithdrawFormValues>
        customLabel={<AssetWithdrawChain />}
        assets={tradable}
        assetFieldName="asset"
        amountFieldName="amount"
      />
      <ModalContentDivider />
      <AddressFormField<AssetWithdrawFormValues> fieldName="address" />
      <ModalContentDivider />
      <AssetWithdrawTransactionFee />
      <ModalContentDivider />
      <ErrorMessageBar
        sx={{ mt: getTokenPx("containers.paddings.secondary") }}
        variant="info"
        description={t("withdraw.asset.info")}
      />
    </ModalBody>
  )
}
