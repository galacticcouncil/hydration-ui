import {
  AccountAvatar,
  Box,
  Flex,
  ScrollArea,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { Address } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { FC } from "react"

import { SRecipientAddressBookItem } from "./RecipientAddressBook.styled"

type RecipientAddressBookProps = {
  addresses: Address[]
  onSelectAddress: (address: string) => void
}

export const RecipientAddressBook: FC<RecipientAddressBookProps> = ({
  addresses,
  onSelectAddress,
}) => (
  <Box mx="var(--modal-content-inset)">
    <ScrollArea height={200}>
      <Stack separated>
        {addresses.map((address) => (
          <SRecipientAddressBookItem
            onClick={() => onSelectAddress(address.address)}
            key={address.publicKey}
          >
            <Flex align="center" gap={10}>
              <AccountAvatar
                address={address.address}
                sx={{ flexShrink: 0 }}
                size={24}
              />
              <Text truncate={120}>{address.name}</Text>
            </Flex>
            <Text>{shortenAccountAddress(address.address)}</Text>
          </SRecipientAddressBookItem>
        ))}
      </Stack>
    </ScrollArea>
  </Box>
)
