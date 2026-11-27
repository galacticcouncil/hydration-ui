import {
  FieldPathByValue,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form"

import { TimeFrame, TimeFrameProps } from "@/components/TimeFrame/TimeFrame"
import { TimeFrame as TimeFrameModel } from "@/components/TimeFrame/TimeFrame.utils"

type Props<TFormValues extends FieldValues> = Omit<
  TimeFrameProps,
  "timeFrame" | "onChange" | "isError"
> & {
  readonly fieldName: FieldPathByValue<TFormValues, TimeFrameModel>
  readonly onChange?: (value: TimeFrameModel) => void
}

export const TimeFrameFormField = <TFormValues extends FieldValues>({
  fieldName,
  onChange,
  ...props
}: Props<TFormValues>) => {
  const { control } = useFormContext<TFormValues>()

  const { field, fieldState } = useController({
    control,
    name: fieldName,
  })

  return (
    <TimeFrame
      timeFrame={field.value}
      isError={!!fieldState.error}
      onChange={(value) => {
        field.onChange(value)
        onChange?.(value)
      }}
      {...props}
    />
  )
}
