import {
  AccountAvatar,
  Box,
  EditableText,
  Flex,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SAccountActionCopyButton } from "@/components/account/AccountActionButton.styled"
import { AccountDeleteButton } from "@/components/account/AccountDeleteButton"
import { Address } from "@/components/address-book/AddressBook.store"
import {
  SAddressBookEntry,
  SAddressBookEntryModeIcon,
} from "@/components/address-book/AddressBookEntry.styled"
import { ProviderLogo } from "@/components/provider/ProviderLogo"
import { WalletMode } from "@/config/wallet"
import i18n from "@/i18n"
import { getWalletModeIcon } from "@/utils/wallet"
import { getWallet } from "@/wallets"

type AddressBookEntryProps = Address & {
  readonly onSelect?: () => void
  readonly onEdit?: (name: string) => void
  readonly onDelete?: () => void
}

export const AddressBookEntry: FC<AddressBookEntryProps> = ({
  address,
  mode,
  name,
  provider,
  isCustom,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation("translations", { i18n })
  const modeIcon = getWalletModeIcon(mode)
  const displayAddress =
    mode === WalletMode.Near ? address : shortenAccountAddress(address)
  const wallet = !isCustom && provider ? getWallet(provider) : null

  return (
    <SAddressBookEntry
      disabled={!onSelect}
      {...(onSelect && { onClick: onSelect })}
    >
      <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <AccountAvatar address={address} size={24} />
          {modeIcon && (
            <SAddressBookEntryModeIcon>
              <img sx={{ size: "xs" }} src={modeIcon} />
            </SAddressBookEntryModeIcon>
          )}
        </Box>
        {onEdit ? (
          <Box sx={{ minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
            <EditableText
              fs="p4"
              fw={600}
              truncate={160}
              value={name}
              placeholder={displayAddress}
              onChange={onEdit}
            />
          </Box>
        ) : (
          <Text fs="p4" fw={600} truncate={160}>
            {name || displayAddress}
          </Text>
        )}
      </Flex>
      <Flex align="center" gap="base" pl="m" ml="auto">
        <Text fs="p4" fw={500} font="mono">
          {displayAddress}
        </Text>
        <Tooltip text={t("addressBook.copyAddress")} size="small" asChild>
          <SAccountActionCopyButton
            iconSize="s"
            aria-label={t("addressBook.copyAddress")}
            text={address}
          />
        </Tooltip>
        {wallet && <ProviderLogo size="s" wallet={wallet} />}
        {onDelete && (
          <Tooltip text={t("addressBook.deleteAddress")} size="small" asChild>
            <AccountDeleteButton
              aria-label={t("addressBook.deleteAddress")}
              onClick={onDelete}
            />
          </Tooltip>
        )}
      </Flex>
    </SAddressBookEntry>
  )
}
