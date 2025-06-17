import { Button, Input, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Controller, FormProvider } from "react-hook-form"
import { first, pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  ExternalWalletFormValues,
  useExternalWalletForm,
} from "@/components/external/ExternalWalletForm.form"
import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect, useWeb3Enable } from "@/hooks"
import { toStoredAccount } from "@/utils"
import { ExternalWallet, getWallet } from "@/wallets"

export const ExternalWalletForm = () => {
  const { enable } = useWeb3Enable()
  const { setAccount, toggle } = useWeb3Connect(
    useShallow(pick(["setAccount", "toggle"])),
  )

  const wallet = getWallet(WalletProviderType.ExternalWallet)

  const form = useExternalWalletForm()

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
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Controller
            name="address"
            control={form.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <Input
                  value={value}
                  onChange={onChange}
                  customSize="large"
                  placeholder="Paste account address here..."
                  isError={!!error}
                />
                {error && (
                  <Text
                    fs={12}
                    font="secondary"
                    fw={400}
                    color={getToken("accents.danger.secondary")}
                  >
                    {error.message}
                  </Text>
                )}
              </>
            )}
          />
          <Button type="submit" size="large" width="100%">
            Confirm
          </Button>
        </Stack>
      </form>
    </FormProvider>
  )
}
