import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import {
  AddressField,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TransferPositionFormValues,
  useTransferPositionForm,
} from "@/modules/wallet/assets/Transfer/TransferPosition.form"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly onClose: () => void
}

export const TransferPositionModal: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { tradable } = useAssets()

  const form = useTransferPositionForm()

  const balances = useAccountData((data) => data.balances)
  const asset = form.watch("asset")
  const balance = scaleHuman(
    balances[asset?.id ?? ""]?.free ?? 0n,
    asset?.decimals ?? 12,
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <ModalHeader title={t("transfer.modal.title")} />
        <ModalBody sx={{ py: 0 }}>
          <ModalContentDivider />
          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <AddressField
                label={t("transfer.modal.address.label")}
                actionLabel={t("transfer.modal.actions.myContacts")}
                address={field.value}
                addressPlaceholder={t("transfer.modal.address.placeholder")}
                isError={!!fieldState.error?.message}
                actionIcon={BookOpen}
                onAddressChange={field.onChange}
              />
            )}
          />
          <ModalContentDivider />
          <AssetSelectFormField<TransferPositionFormValues>
            assetFieldName="asset"
            amountFieldName="amount"
            assets={tradable}
            maxBalance={balance.toString()}
          />
          <ModalContentDivider />
        </ModalBody>
        <ModalFooter
          display={["flex", "grid"]}
          sx={{
            justifyContent: "space-between",
            flexDirection: "row",
            gridTemplateColumns: "1fr",
          }}
        >
          <Button
            size="large"
            variant="tertiary"
            display={[null, "none"]}
            onClick={onClose}
          >
            {t("common:cancel")}
          </Button>
          <Button size="large" type="submit">
            {t("common:confirm")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
