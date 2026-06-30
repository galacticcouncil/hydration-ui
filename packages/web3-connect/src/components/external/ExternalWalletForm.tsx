import {
  AccountInput,
  Button,
  Flex,
  FormError,
  FormLabel,
  Separator,
  Stack,
} from "@galacticcouncil/ui/components"
import {
  isEvmParachainAccount,
  safeConvertAddressH160,
  safeConvertAddressSS58,
  safeConvertSS58toH160,
} from "@galacticcouncil/utils"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first, pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useAddressStore } from "@/components/address-book/AddressBook.store"
import { AddressBookButton } from "@/components/address-book/AddressBookButton"
import { ExternalWalletFormValues } from "@/components/external/ExternalWalletForm.form"
import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect, useWeb3Enable } from "@/hooks"
import { toStoredAccount } from "@/utils"
import { ExternalWallet, getWallet } from "@/wallets"

type ExternalWalletFormProps = {
  readonly onAddressBookOpen: () => void
}

export const ExternalWalletForm: React.FC<ExternalWalletFormProps> = ({
  onAddressBookOpen,
}) => {
  const { t } = useTranslation()
  const { enable } = useWeb3Enable()
  const { setAccount, toggle } = useWeb3Connect(
    useShallow(pick(["setAccount", "toggle"])),
  )

  const form = useFormContext<ExternalWalletFormValues>()
  const { add: addToAddressBook } = useAddressStore()

  const wallet = getWallet(WalletProviderType.ExternalWallet)

  const onSubmit = async (values: ExternalWalletFormValues) => {
    const isExternalWallet = wallet instanceof ExternalWallet

    if (!isExternalWallet) return

    const normalizedAddress = normalizeExternalWalletAddress(values.address)
    const isAccountSet = wallet.setAccount(normalizedAddress, true)
    if (!isAccountSet) return

    addToAddressBook({
      address: normalizedAddress,
      name: "",
      isCustom: true,
    })

    await enable(WalletProviderType.ExternalWallet)

    const accounts = await wallet.getAccounts()
    const account = first(accounts)

    if (account) {
      setAccount(toStoredAccount(account))
      toggle()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="var(--modal-content-padding)">
        <Controller
          name="address"
          control={form.control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Stack gap="m">
              <Flex justify="space-between" align="center">
                <FormLabel>{t("external.addressLabel")}</FormLabel>
                <AddressBookButton onClick={onAddressBookOpen} />
              </Flex>
              <AccountInput
                value={value}
                onChange={onChange}
                placeholder={t("external.addressPlaceholder")}
                isError={!!error}
              />
              {error && <FormError>{error.message}</FormError>}
            </Stack>
          )}
        />
        <Separator mx="var(--modal-content-inset)" />
        <Button type="submit" size="large" width="100%">
          {t("external.confirm")}
        </Button>
      </Stack>
    </form>
  )
}

const normalizeExternalWalletAddress = (address: string) =>
  safeConvertAddressH160(address) ||
  (isEvmParachainAccount(address) ? safeConvertSS58toH160(address) : "") ||
  safeConvertAddressSS58(address) ||
  address
