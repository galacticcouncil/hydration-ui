import {
  FieldPathByValue,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form"

import {
  PeriodInput,
  PeriodInputProps,
  PeriodType,
} from "@/components/PeriodInput/PeriodInput"

type Props<TFormValues extends FieldValues> = Omit<
  PeriodInputProps,
  | "periodValue"
  | "periodType"
  | "onPeriodTypeChange"
  | "onPeriodValueChange"
  | "isError"
> & {
  readonly typeName: FieldPathByValue<TFormValues, PeriodType>
  readonly valueName: FieldPathByValue<TFormValues, number | null>
}

export const PeriodFormField = <TFormValues extends FieldValues>({
  typeName,
  valueName,
  ...periodInputProps
}: Props<TFormValues>) => {
  const { control } = useFormContext<TFormValues>()

  const { field: typeField, fieldState: typeFieldState } = useController({
    control,
    name: typeName,
  })
  const { field: valueField, fieldState: valueFieldState } = useController({
    control,
    name: valueName,
  })

  return (
    <PeriodInput
      periodValue={valueField.value}
      periodType={typeField.value}
      isError={!!typeFieldState.error || !!valueFieldState.error}
      onPeriodTypeChange={typeField.onChange}
      onPeriodValueChange={valueField.onChange}
      {...periodInputProps}
    />
  )
}
