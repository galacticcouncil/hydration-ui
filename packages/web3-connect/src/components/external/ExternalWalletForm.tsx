import {
  AccountInput,
  Button,
  Flex,
  FormError,
  FormLabel,
  Separator,
  Stack,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Controller, useFormContext } from "react-hook-form"
import { first, pick } from "remeda"
import { useShallow } from "zustand/shallow"

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
  const { enable } = useWeb3Enable()
  const { setAccount, toggle } = useWeb3Connect(
    useShallow(pick(["setAccount", "toggle"])),
  )

  const form = useFormContext<ExternalWalletFormValues>()

  const wallet = getWallet(WalletProviderType.ExternalWallet)

  const onSubmit = async (values: ExternalWalletFormValues) => {
    const isExternalWallet = wallet instanceof ExternalWallet

    if (!isExternalWallet) return

    wallet.setAccount(values.address)
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
            <Stack gap={getTokenPx("scales.paddings.m")}>
              <Flex justify="space-between" align="center">
                <FormLabel>Account address</FormLabel>
                <AddressBookButton onClick={onAddressBookOpen} />
              </Flex>
              <AccountInput
                value={value}
                onChange={onChange}
                placeholder="Paste account address here..."
                isError={!!error}
              />
              {error && <FormError>{error.message}</FormError>}
            </Stack>
          )}
        />
        <Separator mx="var(--modal-content-inset)" />
        <Button type="submit" size="large" width="100%">
          Confirm
        </Button>
      </Stack>
    </form>
  )
}
