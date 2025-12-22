import {
  AccountAvatar,
  Box,
  Flex,
  ScrollArea,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { Address } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { FC } from "react"

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
          <Flex
            key={address.publicKey}
            align="center"
            gap={10}
            justify="space-between"
            onClick={() => onSelectAddress(address.address)}
            py={12}
            px="var(--modal-content-padding)"
            sx={{
              cursor: "pointer",
              "&:hover": {
                bg: getToken("controls.dim.accent"),
              },
            }}
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
          </Flex>
        ))}
      </Stack>
    </ScrollArea>
  </Box>
)
