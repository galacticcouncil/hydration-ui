import { Box, NumberInputProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useController, useFormContext } from "react-hook-form"
import { isNumber } from "remeda"

import {
  XcmFormFieldName,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

import { SFormError, SNumberInput } from "./NumberFormField.styled"

type FormFieldProps = NumberInputProps & {
  fieldName: XcmFormFieldName
}

export const NumberFormField: React.FC<FormFieldProps> = ({
  fieldName,
  ...props
}) => {
  const { control } = useFormContext<XcmFormValues>()
  const { field, fieldState } = useController({
    control,
    name: fieldName,
  })

  const error = fieldState.error?.message

  return (
    <Box position="relative">
      <SNumberInput
        value={field.value}
        onValueChange={({ floatValue }) =>
          field.onChange(isNumber(floatValue) ? Big(floatValue).toString() : "")
        }
        isError={!!error}
        allowNegative={false}
        {...props}
      />
      {error && <SFormError>{error}</SFormError>}
    </Box>
  )
}
