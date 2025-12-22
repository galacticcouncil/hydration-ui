import { AccountInput, Flex, Label, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC, useId } from "react"

import { useAddressStore } from "@/components/address-book/AddressBook.store"
import { AddressBookButton } from "@/components/address-book/AddressBookButton"
import { TALISMAN_PROVIDERS } from "@/config/providers"

export type AddressBookProps = {
  readonly address: string
  readonly error?: string
  readonly onAddressChange: (address: string) => void
  readonly onOpenMyContacts: () => void
}

export const AddressBook: FC<AddressBookProps> = ({
  address,
  error,
  onAddressChange,
  onOpenMyContacts,
}) => {
  const id = useId()
  const { addresses } = useAddressStore()
  const provider = addresses.find((a) => a.address === address)?.provider
  const isTalisman = !!provider && TALISMAN_PROVIDERS.includes(provider)

  return (
    <Flex
      py={getTokenPx("containers.paddings.primary")}
      direction="column"
      justify="flex-end"
    >
      <Flex direction="column" gap={getTokenPx("scales.paddings.m")}>
        <Flex justify="space-between" align="center">
          <Label
            fw={500}
            fs={12}
            lh={px(15)}
            color={getToken("text.medium")}
            htmlFor={id}
          >
            Destination address
          </Label>
          <AddressBookButton onClick={onOpenMyContacts} />
        </Flex>
        <AccountInput
          id={id}
          value={address}
          onChange={onAddressChange}
          avatarTheme={isTalisman ? "talisman" : "auto"}
          placeholder="Paste address here..."
          isError={!!error}
        />
      </Flex>
      {error && (
        <Text
          font="secondary"
          fw={400}
          fs={12}
          lh={1}
          color={getToken("accents.danger.secondary")}
          ml="auto"
        >
          {error}
        </Text>
      )}
    </Flex>
  )
}
