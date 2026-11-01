import {
  AccountInput,
  Box,
  Button,
  Flex,
  FormError,
  ScrollArea,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  isEvmParachainAccount,
  safeConvertAddressH160,
  safeConvertAddressSS58,
  safeConvertSS58toH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { useCallback, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first, pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  Address,
  useAddresses,
} from "@/components/address-book/AddressBook.store"
import { WalletSourceCategoryLabel } from "@/components/content/WalletManagementSource"
import { ExternalWalletFormValues } from "@/components/external/ExternalWalletForm.form"
import { ExternalWalletOption } from "@/components/external/ExternalWalletOption"
import { useRecentExternalWallets } from "@/components/external/RecentExternalWallets.store"
import { WalletProviderType } from "@/config/providers"
import { WalletMode } from "@/config/wallet"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWeb3Connect, useWeb3Enable } from "@/hooks"
import { toAccount, toStoredAccount } from "@/utils"
import { addressToPublicKey } from "@/utils/publicKey"
import { getWalletModeByAddress } from "@/utils/wallet"
import { ExternalWallet, getWallet } from "@/wallets"

type WatchableMode = WalletMode.Substrate | WalletMode.EVM

const isWatchableMode = (mode: WalletMode | null): mode is WatchableMode =>
  mode === WalletMode.Substrate || mode === WalletMode.EVM

// Recent rows reuse the address book's name and provider when the address is
// a known contact or wallet account.
const toRecentEntry = (address: string, known: Address[]): Address | null => {
  const publicKey = addressToPublicKey(address)
  const mode = getWalletModeByAddress(address)
  if (!publicKey || !isWatchableMode(mode)) return null

  const entry = known.find((a) => stringEquals(a.publicKey, publicKey))

  return {
    publicKey,
    address,
    mode,
    name: entry?.name ?? "",
    provider: entry?.provider,
    isCustom: entry?.isCustom,
    savedBy: [],
  }
}

const useExternalWalletConnection = () => {
  const { enable } = useWeb3Enable()
  const { isPage, onAccountSelect } = useWeb3ConnectContext()
  const { setAccount, toggle } = useWeb3Connect(
    useShallow(pick(["setAccount", "toggle"])),
  )
  const addRecent = useRecentExternalWallets((state) => state.add)
  const wallet = getWallet(WalletProviderType.ExternalWallet)

  const connectExternalWallet = useCallback(
    async (address: string) => {
      if (!(wallet instanceof ExternalWallet)) return false

      const normalizedAddress = normalizeExternalWalletAddress(address)
      if (!wallet.setAccount(normalizedAddress, true)) return false

      await enable(WalletProviderType.ExternalWallet)

      const account = first(await wallet.getAccounts())
      if (!account) return false

      addRecent(normalizedAddress)
      if (isPage) {
        onAccountSelect(toAccount(toStoredAccount(account)))
      } else {
        setAccount(toStoredAccount(account))
        toggle()
      }
      return true
    },
    [addRecent, enable, setAccount, toggle, wallet, isPage, onAccountSelect],
  )

  return { connectExternalWallet }
}

export const ExternalWalletForm = () => {
  const { t } = useTranslation()
  const form = useFormContext<ExternalWalletFormValues>()
  const { connectExternalWallet } = useExternalWalletConnection()
  const recentAddresses = useRecentExternalWallets((state) => state.addresses)
  const removeRecent = useRecentExternalWallets((state) => state.remove)
  const addresses = useAddresses()

  const recents = useMemo(
    () =>
      recentAddresses
        .map((address) => toRecentEntry(address, addresses))
        .filter((address) => address !== null),
    [recentAddresses, addresses],
  )

  const contacts = useMemo(
    () => addresses.filter((address) => isWatchableMode(address.mode)),
    [addresses],
  )

  const value = form.watch("address")
  const isValid = !!value.trim() && !form.formState.errors.address
  const { isSubmitting } = form.formState

  // Typing a partial address or name filters the list; a full valid address
  // doesn't, so the list doesn't collapse right before submitting.
  const query = isValid ? "" : value.trim().toLowerCase()
  const matches = (address: Address) =>
    !query ||
    address.address.toLowerCase().includes(query) ||
    address.name.toLowerCase().includes(query)

  const sections = [
    { key: "recent", entries: recents.filter(matches) },
    { key: "contacts", entries: contacts.filter(matches) },
  ].filter(({ entries }) => entries.length)

  const submit = form.handleSubmit(({ address }) =>
    connectExternalWallet(address),
  )

  const onSelect = (address: Address) => {
    if (isSubmitting) return
    form.setValue("address", address.address, { shouldValidate: true })
    submit()
  }

  return (
    <form onSubmit={submit} sx={{ height: "100%" }}>
      <Stack gap="base" height="100%">
        <Controller
          name="address"
          control={form.control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Stack gap="s">
              <AccountInput
                variant="standalone"
                value={value}
                onChange={onChange}
                placeholder={t("external.addressPlaceholder")}
                aria-label={t("external.addressLabel")}
                isError={!!error}
                trailingElement={
                  isValid && (
                    <Button
                      type="submit"
                      variant="accent"
                      size="small"
                      outline
                      disabled={isSubmitting}
                      aria-label={t("external.confirm")}
                    >
                      {t("external.confirm")}
                    </Button>
                  )
                }
              />
              {error && <FormError>{error.message}</FormError>}
            </Stack>
          )}
        />
        <Box flex={1} height="100%" overflow="hidden" sx={{ minHeight: 0 }}>
          <ScrollArea>
            <Flex direction="column" gap="base" minWidth={0} pr="base" pb="xs">
              {sections.length ? (
                sections.map(({ key, entries }) => (
                  <Flex key={key} direction="column" gap="s">
                    <WalletSourceCategoryLabel>
                      {t(`external.section.${key}`)}
                    </WalletSourceCategoryLabel>
                    <Flex direction="column" gap="base">
                      {entries.map((address) => (
                        <ExternalWalletOption
                          key={address.publicKey}
                          {...address}
                          onSelect={() => onSelect(address)}
                          onDelete={
                            key === "recent"
                              ? () => removeRecent(address.address)
                              : undefined
                          }
                        />
                      ))}
                    </Flex>
                  </Flex>
                ))
              ) : (
                <Text
                  fs="p5"
                  color={getToken("text.low")}
                  py="l"
                  align="center"
                >
                  {t("external.empty")}
                </Text>
              )}
            </Flex>
          </ScrollArea>
        </Box>
      </Stack>
    </form>
  )
}

const normalizeExternalWalletAddress = (address: string) =>
  safeConvertAddressH160(address) ||
  (isEvmParachainAccount(address) ? safeConvertSS58toH160(address) : "") ||
  safeConvertAddressSS58(address) ||
  address
