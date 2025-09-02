import {
  AccountInput,
  Box,
  Button,
  FormError,
  Label,
  Separator,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { arraySearch, isValidAddressOnChain } from "@galacticcouncil/utils"
import { useAddressStore } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useUnmount } from "react-use"
import { z } from "zod/v4"

import { EmptyState } from "@/components/EmptyState"
import { RecipientAddressBook } from "@/modules/xcm/transfer/components/Recipient"
import { validateAddressOnChain } from "@/utils/validators"

export const createSchema = (destChain: AnyChain) => {
  return z.object({
    customAddress: validateAddressOnChain(destChain),
  })
}

export type CustomAddressFormValues = z.infer<ReturnType<typeof createSchema>>

export type RecipientCustomAddressFormProps = {
  destChain: AnyChain
  onSubmit: (address: string) => void
  onChange: (address: string) => void
}

export const RecipientCustomAddressForm: React.FC<
  RecipientCustomAddressFormProps
> = ({ destChain, onSubmit, onChange }) => {
  const { t } = useTranslation("xcm")

  useUnmount(() => onChange(""))
  const form = useForm<CustomAddressFormValues>({
    resolver: standardSchemaResolver(createSchema(destChain)),
    mode: "onChange",
    defaultValues: {
      customAddress: "",
    },
  })

  const { addresses } = useAddressStore()

  const customAddress = form.watch("customAddress")
  const addressBookAddresses = arraySearch(
    addresses.filter((a) => {
      return a.isCustom && isValidAddressOnChain(a.address, destChain)
    }),
    customAddress,
    ["name", "address"],
  )

  const isSearchMode = !!customAddress.trim() && addressBookAddresses.length > 0

  return (
    <form
      onSubmit={form.handleSubmit(({ customAddress }) =>
        onSubmit(customAddress.trim()),
      )}
    >
      <Controller
        name="customAddress"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Box position="relative" py={20}>
            <Label
              htmlFor={field.name}
              fs="p5"
              color={getToken("text.medium")}
              pb={10}
              display="block"
            >
              {t("recipient.input.customWallet")}
            </Label>
            <AccountInput
              id={field.name}
              placeholder={t("recipient.input.placeholder")}
              autoComplete="off"
              spellCheck={false}
              {...field}
              onChange={(value) => {
                field.onChange(value)
                onChange(value)
              }}
            />
            {error && !isSearchMode && (
              <FormError mt={10}>{error.message}</FormError>
            )}
          </Box>
        )}
      />
      <Separator mx="var(--modal-content-inset)" />
      {addressBookAddresses.length > 0 ? (
        <RecipientAddressBook
          addresses={addressBookAddresses}
          onSelectAddress={onSubmit}
        />
      ) : (
        <EmptyState
          header=""
          description={t("recipient.modal.empty.description")}
        />
      )}
      <Separator
        mb="var(--modal-content-padding)"
        mx="var(--modal-content-inset)"
      />
      <Button
        type="submit"
        width="100%"
        size="large"
        variant="primary"
        disabled={!form.formState.isValid}
      >
        {t("recipient.button.confirm")}
      </Button>
    </form>
  )
}
