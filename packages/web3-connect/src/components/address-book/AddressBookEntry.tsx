import {
  AccountAvatar,
  Box,
  EditableText,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { AccountDeleteButton } from "@/components/account/AccountDeleteButton"
import {
  SAddressBookEntry,
  SAddressBookEntryCopyButton,
} from "@/components/address-book/AddressBookEntry.styled"
import { WalletMode } from "@/config/wallet"
import { getWalletModeIcon } from "@/utils/wallet"

type AddressBookEntryProps = {
  readonly address: string
  readonly mode: WalletMode
  readonly name: string
  readonly onSelect?: () => void
  readonly onEdit?: (name: string) => void
  readonly onDelete?: () => void
}

export const AddressBookEntry: FC<AddressBookEntryProps> = ({
  address,
  mode,
  name,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const modeIcon = getWalletModeIcon(mode)
  const displayAddress =
    mode === WalletMode.Near ? address : shortenAccountAddress(address)

  return (
    <SAddressBookEntry
      disabled={!onSelect}
      {...(onSelect && { onClick: onSelect })}
    >
      <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <AccountAvatar address={address} size={24} />
          {modeIcon && (
            <Box
              sx={{
                position: "absolute",
                bottom: "-s",
                right: "-s",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: getToken("surfaces.themeBasePalette.surfaceHigh"),
                overflow: "hidden",
              }}
              borderRadius="full"
            >
              <img sx={{ size: "xs" }} src={modeIcon} />
            </Box>
          )}
        </Box>
        {onEdit ? (
          <Box sx={{ minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
            <EditableText
              fs="p3"
              fw={500}
              truncate={120}
              value={name}
              placeholder={displayAddress}
              onChange={onEdit}
            />
          </Box>
        ) : (
          <Text fs="p4" fw={500} truncate={120}>
            {name || displayAddress}
          </Text>
        )}
      </Flex>
      <Flex align="center" gap="base" pl="m" ml="auto">
        <Text fs="p5" fw={500} color={getToken("text.medium")}>
          {displayAddress}
        </Text>
        <SAddressBookEntryCopyButton aria-label="Copy address" text={address} />
        {onDelete && (
          <AccountDeleteButton aria-label="Delete address" onClick={onDelete} />
        )}
      </Flex>
    </SAddressBookEntry>
  )
}
