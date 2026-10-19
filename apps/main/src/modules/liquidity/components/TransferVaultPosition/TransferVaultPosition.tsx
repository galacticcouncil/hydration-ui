import {
  Alert,
  Box,
  Button,
  Flex,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { AddressBookModal, WalletMode } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Hex } from "viem"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"
import { scale, scaleHuman } from "@/utils/formatting"

import {
  TransferVaultPositionValues,
  useTransferVaultPositionForm,
} from "./TransferVaultPosition.form"
import { useVaultTransfer } from "./TransferVaultPosition.utils"

type TransferVaultPositionProps = { vault: VaultTable; onClose: () => void }

export const TransferVaultPosition: FC<TransferVaultPositionProps> = ({
  vault,
  onClose,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const balance = scaleHuman(vault.positionShares, 18)
  const form = useTransferVaultPositionForm(balance)
  const transfer = useVaultTransfer()
  const [contactsOpen, setContactsOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const mutation = useMutation({
    mutationFn: async ({ amount, address }: TransferVaultPositionValues) => {
      if (!vault.vault) throw new Error("Vault not found")
      if (!accepted) throw new Error("Transfer disclaimer not accepted")
      await transfer({
        pool: vault.pool,
        vault: vault.vault,
        shares: BigInt(scale(amount, 18)),
        recipient: safeConvertAnyToH160(address) as Hex,
        amount,
      })
      onClose()
    },
  })

  if (contactsOpen)
    return (
      <AddressBookModal
        whitelist={[WalletMode.Substrate, WalletMode.EVM]}
        onBack={() => setContactsOpen(false)}
        onSelect={({ address }) => {
          form.setValue("address", address, { shouldValidate: true })
          setAccepted(false)
          setContactsOpen(false)
        }}
      />
    )

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <ModalHeader align="center" title={t("transfer.modal.title")} />
        <ModalBody sx={{ py: 0 }}>
          <ModalContentDivider />
          <Box py="l" width="100%">
            <AssetSelect
              label={t("transfer.modal.asset.label")}
              assets={[]}
              selectedAsset={{
                id: vault.vault?.address ?? vault.id,
                symbol: vault.vault?.shareSymbol ?? t("common:shares"),
                decimals: 18,
                iconId: vault.pair.map(({ id }) => id),
              }}
              value={form.watch("amount")}
              onChange={(value) =>
                form.setValue("amount", value, { shouldValidate: true })
              }
              amountError={form.formState.errors.amount?.message}
              balance={{ value: balance, isLoading: false }}
              displayValue=""
            />
          </Box>
          <ModalContentDivider />
          <AddressBookFormField<TransferVaultPositionValues>
            fieldName="address"
            onOpenMyContacts={() => setContactsOpen(true)}
          />
          <ModalContentDivider />
        </ModalBody>
        <ModalFooter
          display="grid"
          sx={{ gridTemplateColumns: "1fr", gap: "xl" }}
        >
          <Alert
            variant="warning"
            description={t("transfer.modal.warning.nonNative")}
            action={
              <Flex as="label" gap="base" align="center">
                <Toggle
                  size="large"
                  checked={accepted}
                  onCheckedChange={setAccepted}
                />
                <Text fs="p4" lh={1.3} fw={600}>
                  {t("transfer.modal.acceptance.cex")}
                </Text>
              </Flex>
            }
          />
          <Button
            size="large"
            variant="tertiary"
            display={[null, "none"]}
            onClick={onClose}
          >
            {t("common:cancel")}
          </Button>
          <LoadingButton
            isLoading={mutation.isPending}
            size="large"
            type="submit"
            disabled={!form.formState.isValid || !accepted}
          >
            {t("common:confirm")}
          </LoadingButton>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
