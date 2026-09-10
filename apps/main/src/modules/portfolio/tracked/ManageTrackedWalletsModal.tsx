import {
  AccountInput,
  Button,
  Flex,
  FormError,
  FormLabel,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import {
  AddressBookButton,
  AddressBookModal,
  addressToPublicKey,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  ManageTrackedWalletsFormValues,
  useManageTrackedWalletsForm,
} from "@/modules/portfolio/tracked/ManageTrackedWalletsModal.form"
import { TrackedWalletEntry } from "@/modules/portfolio/tracked/TrackedWalletEntry"
import {
  useTrackedWalletActions,
  useTrackedWallets,
} from "@/states/trackedWallets"

type Props = {
  readonly onSaved?: (address: string) => void
}

export const ManageTrackedWalletsModal: FC<Props> = ({ onSaved }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()

  const wallets = useTrackedWallets()
  const { add, remove } = useTrackedWalletActions()

  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)

  const form = useManageTrackedWalletsForm()
  const address = form.watch("address")

  const accountPublicKey = account ? addressToPublicKey(account.address) : ""

  const onSubmit = ({ address }: ManageTrackedWalletsFormValues) => {
    const normalized = address.trim()
    add(normalized)
    form.reset()
    onSaved?.(normalized)
  }

  if (isAddressBookOpen) {
    return (
      <AddressBookModal
        excludePublicKeys={accountPublicKey ? [accountPublicKey] : []}
        onBack={() => setIsAddressBookOpen(false)}
        onSelect={(selected) => {
          form.setValue("address", selected.address.trim(), {
            shouldValidate: true,
          })
          setIsAddressBookOpen(false)
        }}
      />
    )
  }

  return (
    <>
      <ModalHeader align="center" title={t("myAssets.tracked.modal.title")} />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalBody scrollable={false}>
          <Stack>
            <Flex justify="space-between" align="center">
              <FormLabel>{t("myAssets.tracked.modal.addressLabel")}</FormLabel>
              <AddressBookButton onClick={() => setIsAddressBookOpen(true)} />
            </Flex>
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <AccountInput
                    {...field}
                    isError={!!error}
                    placeholder={t("myAssets.tracked.modal.placeholder")}
                    onChange={(value) => field.onChange(value)}
                  />
                  {error && <FormError>{error.message}</FormError>}
                </>
              )}
            />
            <ModalContentDivider my="xl" />
            <Button
              disabled={!address.trim()}
              size="large"
              type="submit"
              width="100%"
            >
              {t("myAssets.tracked.manage.save")}
            </Button>
          </Stack>
        </ModalBody>
      </form>
      {wallets.length > 0 && (
        <ModalBody noPadding>
          <Flex direction="column" gap="base" sx={{ flexShrink: 0 }}>
            <Text fs="p5" fw={500} color="text.high" px="xl" pt="xl">
              {t("myAssets.tracked.title")}
            </Text>

            <Separator />

            <Stack separated>
              {wallets.map((wallet) => (
                <TrackedWalletEntry
                  key={wallet.publicKey}
                  address={wallet.address}
                  onRemove={() => remove(wallet.publicKey)}
                />
              ))}
            </Stack>
          </Flex>
        </ModalBody>
      )}
    </>
  )
}
