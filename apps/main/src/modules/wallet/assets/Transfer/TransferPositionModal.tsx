import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { AddressBookModal, useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TransferPositionFormValues,
  useTransferPositionForm,
} from "@/modules/wallet/assets/Transfer/TransferPosition.form"
import { useSubmitTransferPosition } from "@/modules/wallet/assets/Transfer/TransferPositionModal.submit"
import { isErc20AToken, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly assetId?: string
  readonly onClose: () => void
}

export const TransferPositionModal: FC<Props> = ({ assetId, onClose }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()
  const { tradable } = useAssets()

  const transferPosition = useSubmitTransferPosition({ onClose })
  const form = useTransferPositionForm({ assetId })
  const shouldValidate = form.formState.isSubmitted

  const [isMyContactsOpen, setIsMyContactsOpen] = useState(false)

  const [asset, amount] = form.watch(["asset", "amount"])

  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(useRpcProvider(), {
      address: account?.address ?? "",
      assetId: asset && isErc20AToken(asset) ? asset.underlyingAssetId : "",
      amount,
    }),
  )

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  if (isMyContactsOpen) {
    return (
      <AddressBookModal
        header={
          <ModalHeader
            title={t("common:addressBook.modal.title")}
            onBack={() => setIsMyContactsOpen(false)}
          />
        }
        onSelect={(address) => {
          form.setValue("address", address.address, { shouldValidate })
          setIsMyContactsOpen(false)
        }}
      />
    )
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          transferPosition.mutate(values),
        )}
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
          {healthFactor && (
            <HealthFactorRiskWarning
              message={t("common:healthFactor.warning")}
              accepted={healthFactorRiskAccepted}
              onAcceptedChange={setHealthFactorRiskAccepted}
              isUserConsentRequired={healthFactor.isUserConsentRequired}
            />
          )}
          <Button
            size="large"
            variant="tertiary"
            display={[null, "none"]}
            onClick={onClose}
          >
            {t("common:cancel")}
          </Button>
          <Button
            size="large"
            type="submit"
            disabled={!isHealthFactorCheckSatisfied}
          >
            {t("common:confirm")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
