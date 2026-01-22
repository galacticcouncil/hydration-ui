import {
  AccountInput,
  Box,
  Button,
  FormError,
  Label,
  ModalContentDivider,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  arraySearch,
  isAddressValidOnChain,
  preventDefault,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import {
  getWalletModeByAddress,
  PROVIDERS_BY_WALLET_MODE,
} from "@galacticcouncil/web3-connect"
import { useAddressStore } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { AnyChain } from "@galacticcouncil/xc-core"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMemo } from "react"
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

  const { addresses, add: addAddressToAddressBook } = useAddressStore()

  const customAddress = form.watch("customAddress")

  const customAddressesOnChain = useMemo(
    () =>
      addresses.filter(
        (a) => a.isCustom && isAddressValidOnChain(a.address, destChain),
      ),
    [addresses, destChain],
  )

  const addressBookAddresses = arraySearch(
    customAddressesOnChain,
    customAddress,
    ["name", "address"],
  )

  const isSearchMode = !!customAddress.trim() && addressBookAddresses.length > 0

  const onSubmitHandler = (values: CustomAddressFormValues) => {
    const address = values.customAddress.trim()
    const addressPublicKey = safeConvertSS58toPublicKey(address)
    const addressProvider = getWalletModeByAddress(address)
    const walletProvider = addressProvider
      ? PROVIDERS_BY_WALLET_MODE[addressProvider][0]
      : null
    const canAdd =
      !!walletProvider &&
      !addresses.find((address) => address.publicKey === addressPublicKey)
    if (canAdd) {
      addAddressToAddressBook({
        address,
        publicKey: safeConvertSS58toPublicKey(address),
        name: "My Account",
        provider: walletProvider,
        isCustom: true,
      })
    }
    onSubmit(address)
  }

  return (
    <form onSubmit={preventDefault}>
      <Controller
        name="customAddress"
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <Box position="relative" py="xl">
            <Label
              htmlFor={field.name}
              fs="p5"
              color={getToken("text.medium")}
              pb="base"
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
              <FormError mt="base">{error.message}</FormError>
            )}
          </Box>
        )}
      />
      <ModalContentDivider />
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
      <ModalContentDivider mb="var(--modal-content-padding)" />
      <Button
        width="100%"
        size="large"
        disabled={!form.formState.isValid}
        variant={form.formState.isValid ? "primary" : "tertiary"}
        onClick={() => form.handleSubmit(onSubmitHandler)()}
      >
        {t("recipient.button.confirm")}
      </Button>
    </form>
  )
}
