import { FieldPathByValue, FieldValues, useFormContext } from "react-hook-form"
import { useController } from "react-hook-form"

import { AddressBookProps } from "@/components/AddressBook/AddressBook"
import { AddressBook } from "@/components/AddressBook/AddressBook"

type Props<TFormValues extends FieldValues> = Omit<
  AddressBookProps,
  "address" | "onAddressChange" | "isError"
> & {
  readonly fieldName: FieldPathByValue<TFormValues, string>
}

export const AddressBookFormField = <TFormValues extends FieldValues>({
  fieldName,
  ...props
}: Props<TFormValues>) => {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ control, name: fieldName })

  return (
    <AddressBook
      {...props}
      address={field.value}
      onAddressChange={field.onChange}
      isError={!!fieldState.error?.message}
    />
  )
}
