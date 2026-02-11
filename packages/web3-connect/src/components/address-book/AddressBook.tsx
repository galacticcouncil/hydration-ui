import { AccountInput, Flex, Label, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useId } from "react"
import { useTranslation } from "react-i18next"

import { useAddressStore } from "@/components/address-book/AddressBook.store"
import { AddressBookButton } from "@/components/address-book/AddressBookButton"
import { TALISMAN_PROVIDERS } from "@/config/providers"
import i18n from "@/i18n"

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
  const { t } = useTranslation("translations", { i18n })
  const id = useId()
  const { addresses } = useAddressStore()
  const provider = addresses.find((a) => a.address === address)?.provider
  const isTalisman = !!provider && TALISMAN_PROVIDERS.includes(provider)

  return (
    <Flex py="xxl" direction="column" justify="flex-end">
      <Flex direction="column" gap="m">
        <Flex justify="space-between" align="center">
          <Label
            fw={500}
            fs="p5"
            lh="s"
            color={getToken("text.medium")}
            htmlFor={id}
          >
            {t("addressBook.destinationAddress")}
          </Label>
          <AddressBookButton onClick={onOpenMyContacts} />
        </Flex>
        <AccountInput
          id={id}
          value={address}
          onChange={onAddressChange}
          avatarTheme={isTalisman ? "talisman" : "auto"}
          placeholder={t("addressBook.placeholder")}
          isError={!!error}
        />
      </Flex>
      {error && (
        <Text
          font="secondary"
          fw={400}
          fs="p5"
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
