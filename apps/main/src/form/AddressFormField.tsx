import { AddressField, AddressFieldProps } from "@galacticcouncil/ui/components"
import { FieldPathByValue, FieldValues, useFormContext } from "react-hook-form"
import { useController } from "react-hook-form"

type Props<TFormValues extends FieldValues> = Omit<
  AddressFieldProps,
  "address" | "onAddressChange" | "isError"
> & {
  readonly fieldName: FieldPathByValue<TFormValues, string>
}

export const AddressFormField = <TFormValues extends FieldValues>({
  fieldName,
  ...props
}: Props<TFormValues>) => {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ control, name: fieldName })

  return (
    <AddressField
      {...props}
      address={field.value}
      onAddressChange={field.onChange}
      isError={!!fieldState.error?.message}
    />
  )
}
