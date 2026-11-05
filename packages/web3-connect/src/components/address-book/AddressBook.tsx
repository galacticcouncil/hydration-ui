import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import {
  AccountInput,
  Button,
  Flex,
  InputSuggestionsInputProps,
  Label,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useId } from "react"
import { useTranslation } from "react-i18next"

import { AddressBookButton } from "@/components/address-book/AddressBookButton"
import i18n from "@/i18n"

export type AddressBookProps = {
  readonly address: string
  readonly error?: string
  readonly headerAction?: React.ReactNode
  readonly contactsVariant?: "button" | "icon"
  readonly inputProps?: InputSuggestionsInputProps
  readonly onAddressChange: (address: string) => void
  readonly onOpenMyContacts: () => void
}

export const AddressBook: FC<AddressBookProps> = ({
  address,
  error,
  headerAction,
  contactsVariant = "button",
  inputProps,
  onAddressChange,
  onOpenMyContacts,
}) => {
  const { t } = useTranslation("translations", { i18n })
  const id = useId()

  return (
    <Flex py="xl" direction="column" justify="flex-end">
      <Flex direction="column" gap="m">
        <Flex justify="space-between" align="center">
          <Label
            fw={500}
            fs="p5"
            lh={1.2}
            color={getToken("text.medium")}
            htmlFor={id}
          >
            {t("addressBook.destinationAddress")}
          </Label>
          {headerAction ??
            (contactsVariant === "button" && (
              <AddressBookButton onClick={onOpenMyContacts} />
            ))}
        </Flex>
        <AccountInput
          {...inputProps}
          id={id}
          value={address}
          onChange={onAddressChange}
          placeholder={t("addressBook.placeholder")}
          isError={!!error}
          autoComplete={inputProps ? "off" : undefined}
          endAdornment={
            contactsVariant === "icon" ? (
              <Tooltip
                text={t("addressBook.myContacts")}
                size="small"
                delayDuration={0}
                side="bottom"
                asChild
              >
                <Button
                  icon={BookOpen}
                  variant="ghost"
                  type="button"
                  aria-label={t("addressBook.myContacts")}
                  onClick={onOpenMyContacts}
                />
              </Tooltip>
            ) : undefined
          }
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
