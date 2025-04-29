import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AddressBookModal } from "@/components/AddressBook/AddressBookModal"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TransferPosition,
  TransferPositionFormValues,
  useTransferPositionForm,
} from "@/modules/wallet/assets/Transfer/TransferPosition.form"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly position?: TransferPosition
  readonly onClose: () => void
}

export const TransferPositionModal: FC<Props> = ({ position, onClose }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { tradable } = useAssets()

  const form = useTransferPositionForm({ position })
  const shouldValidate = form.formState.isSubmitted

  const balances = useAccountData((data) => data.balances)
  const asset = form.watch("asset")
  const balance = scaleHuman(
    balances[asset?.id ?? ""]?.free ?? 0n,
    asset?.decimals ?? 12,
  )

  const [isMyContactsOpen, setIsMyContactsOpen] = useState(false)

  if (isMyContactsOpen) {
    return (
      <AddressBookModal
        onBack={() => setIsMyContactsOpen(false)}
        onSelect={(address) => {
          form.setValue("address", address, { shouldValidate })
          setIsMyContactsOpen(false)
        }}
      />
    )
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((v) => {
          console.log("transfer position TODO", v)
        })}
      >
        <ModalHeader title={t("transfer.modal.title")} />
        <ModalBody sx={{ py: 0 }}>
          <ModalContentDivider />
          <AddressBookFormField<TransferPositionFormValues>
            fieldName="address"
            onOpenMyContacts={() => setIsMyContactsOpen(true)}
          />
          <ModalContentDivider />
          <AssetSelectFormField<TransferPositionFormValues>
            assetFieldName="asset"
            amountFieldName="amount"
            assets={tradable}
            maxBalance={balance.toString()}
            disabled={!!position}
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
