import { Box, Modal, ScrollArea, Stack } from "@galacticcouncil/ui/components"
import {
  AddressBookEntry,
  useAddressStore,
} from "@galacticcouncil/web3-connect"
import { AccountRemoveModal } from "@galacticcouncil/web3-connect/src/components/account/AccountRemoveModal"
import { type Address } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { FC, useState } from "react"

type RecipientAddressBookProps = {
  addresses: Address[]
  onSelectAddress: (address: string) => void
}

export const RecipientAddressBook: FC<RecipientAddressBookProps> = ({
  addresses,
  onSelectAddress,
}) => {
  const [publicKeyToRemove, setPublicKeyToRemove] = useState("")
  const { edit, remove } = useAddressStore()

  return (
    <>
      <Box mx="var(--modal-content-inset)">
        <ScrollArea height={200}>
          <Stack separated>
            {addresses.map((address) => (
              <AddressBookEntry
                key={address.publicKey}
                address={address.address}
                mode={address.mode}
                name={address.name}
                onSelect={() => onSelectAddress(address.address)}
                onEdit={(name) =>
                  edit({
                    ...address,
                    name,
                  })
                }
                onDelete={() => setPublicKeyToRemove(address.publicKey)}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Box>
      <Modal
        variant="popup"
        open={!!publicKeyToRemove}
        onOpenChange={(open) => {
          if (!open) setPublicKeyToRemove("")
        }}
        disableInteractOutside
      >
        <AccountRemoveModal
          align="center"
          onDelete={() => {
            remove(publicKeyToRemove)
            setPublicKeyToRemove("")
          }}
          onCancel={() => setPublicKeyToRemove("")}
          onBack={() => setPublicKeyToRemove("")}
        />
      </Modal>
    </>
  )
}
