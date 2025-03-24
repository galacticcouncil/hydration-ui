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

const maxBalance = "30"

export const TransferPositionModal: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { tradable } = useAssets()

  const form = useTransferPositionForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <ModalHeader title={t("transfer.modal.title")} />
        <ModalBody>
          <Controller
            control={form.control}
            name="address"
            render={({ field }) => (
              <AddressField
                label={t("transfer.modal.address.label")}
                actionLabel={t("transfer.modal.actions.myContacts")}
                address={field.value}
                addressPlaceholder={t("transfer.modal.address.placeholder")}
                onAddressChange={field.onChange}
                actionIcon={BookOpen}
              />
            )}
          />
          <ModalContentDivider />
          <AssetSelectFormField<TransferPositionFormValues>
            assetFieldName="asset"
            amountFieldName="amount"
            assets={tradable}
            maxBalance={maxBalance}
          />
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
            type="submit"
            size="large"
            variant="tertiary"
            display={[null, "none"]}
          >
            {t("common:cancel")}
          </Button>
          <Button size="large">{t("common:confirm")}</Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
