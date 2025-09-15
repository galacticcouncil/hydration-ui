import {
  AccountInput,
  Button,
  Flex,
  Label,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { BookOpen } from "lucide-react"
import { FC, useId } from "react"

import { useAddressStore } from "@/components/address-book/AddressBook.store"
import { SAddressBook } from "@/components/address-book/AddressBook.styled"
import { TALISMAN_PROVIDERS } from "@/config/providers"

export type AddressBookProps = {
  readonly address: string
  readonly isError?: boolean
  readonly onAddressChange: (address: string) => void
  readonly onOpenMyContacts: () => void
}

export const AddressBook: FC<AddressBookProps> = ({
  address,
  isError,
  onAddressChange,
  onOpenMyContacts,
}) => {
  const id = useId()
  const { addresses } = useAddressStore()
  const provider = addresses.find((a) => a.address === address)?.provider
  const isTalisman = !!provider && TALISMAN_PROVIDERS.includes(provider)

  return (
    <SAddressBook>
      <Flex justify="space-between" align="center">
        <Label
          fw={500}
          fs="p5"
          lh={1.2}
          color={getToken("text.medium")}
          htmlFor={id}
        >
          Destination address
        </Label>
        <Button
          variant="accent"
          outline
          size="small"
          sx={{ textTransform: "uppercase" }}
          onClick={onOpenMyContacts}
        >
          My contacts
          <BookOpen />
        </Button>
      </Flex>
      <AccountInput
        id={id}
        value={address}
        onChange={onAddressChange}
        avatarTheme={isTalisman ? "talisman" : "auto"}
        placeholder="Paste address here..."
        isError={isError}
      />
    </SAddressBook>
  )
}
