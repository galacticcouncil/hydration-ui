import {
  AccountInput,
  Box,
  Button,
  FormError,
  ScrollArea,
  Stack,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  isEvmParachainAccount,
  safeConvertAddressH160,
  safeConvertAddressSS58,
  safeConvertSS58toH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { useCallback, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { first, pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  Address,
  useAddresses,
} from "@/components/address-book/AddressBook.store"
import { AddressBookEntry } from "@/components/address-book/AddressBookEntry"
import { SScrollAreaContent } from "@/components/content/WalletManagementContent.styled"
import { ExternalWalletFormValues } from "@/components/external/ExternalWalletForm.form"
import { useRecentExternalWallets } from "@/components/external/RecentExternalWallets.store"
import { WalletProviderType } from "@/config/providers"
import { WalletMode } from "@/config/wallet"
import { useWeb3Connect, useWeb3Enable } from "@/hooks"
import { toStoredAccount } from "@/utils"
import { addressToPublicKey } from "@/utils/publicKey"
import { getWalletModeByAddress } from "@/utils/wallet"
import { ExternalWallet, getWallet } from "@/wallets"

type ExternalWalletTab = "recent" | "contacts"

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
      setAccount(toStoredAccount(account))
      toggle()
      return true
    },
    [addRecent, enable, setAccount, toggle, wallet],
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

  const contacts = useMemo(
    () => addresses.filter((address) => isWatchableMode(address.mode)),
    [addresses],
  )
  const recents = useMemo(
    () =>
      recentAddresses
        .map((address) => toRecentEntry(address, addresses))
        .filter((address) => address !== null),
    [recentAddresses, addresses],
  )

  // Unset until the user picks a tab, so the default follows the recent list
  // once the persisted store has hydrated.
  const [selectedTab, setSelectedTab] = useState<ExternalWalletTab | null>(null)
  const tab = selectedTab ?? (recents.length ? "recent" : "contacts")

  const value = form.watch("address")
  const isValid = !!value.trim() && !form.formState.errors.address
  const { isSubmitting } = form.formState

  // Typing a partial address or name filters the list; a full valid address
  // doesn't, so the list doesn't collapse right before submitting.
  const query = isValid ? "" : value.trim().toLowerCase()
  const entries = (tab === "recent" ? recents : contacts).filter(
    (address) =>
      !query ||
      address.address.toLowerCase().includes(query) ||
      address.name.toLowerCase().includes(query),
  )

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
      <Stack gap="var(--modal-content-padding)" height="100%">
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
                      sx={{ px: "base" }}
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
        <Stack gap="base" flex={1} sx={{ minHeight: 0 }}>
          <ToggleGroup
            type="single"
            value={tab}
            fullWidth
            onValueChange={(tab) => tab && setSelectedTab(tab)}
          >
            <ToggleGroupItem value="recent">
              {t("external.tab.recent", { count: recents.length })}
            </ToggleGroupItem>
            <ToggleGroupItem value="contacts">
              {t("external.tab.contacts", { count: contacts.length })}
            </ToggleGroupItem>
          </ToggleGroup>
          <Box flex={1} height="100%" overflow="hidden" sx={{ minHeight: 0 }}>
            <ScrollArea>
              <SScrollAreaContent>
                {entries.length ? (
                  <Stack separated>
                    {entries.map((address) => (
                      <AddressBookEntry
                        key={address.publicKey}
                        {...address}
                        onSelect={() => onSelect(address)}
                        onDelete={
                          tab === "recent"
                            ? () => removeRecent(address.address)
                            : undefined
                        }
                      />
                    ))}
                  </Stack>
                ) : (
                  <Text
                    fs="p5"
                    color={getToken("text.low")}
                    py="l"
                    align="center"
                  >
                    {t(`external.empty.${tab}`)}
                  </Text>
                )}
              </SScrollAreaContent>
            </ScrollArea>
          </Box>
        </Stack>
      </Stack>
    </form>
  )
}

const normalizeExternalWalletAddress = (address: string) =>
  safeConvertAddressH160(address) ||
  (isEvmParachainAccount(address) ? safeConvertSS58toH160(address) : "") ||
  safeConvertAddressSS58(address) ||
  address
