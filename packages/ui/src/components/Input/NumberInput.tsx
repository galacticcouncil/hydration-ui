import { FC, Ref, useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

import { Input, InputProps } from "./Input"

/**
 * For detailed props documentation
 * @see https://s-yadav.github.io/react-number-format/docs/numeric_format
 */
export type NumberInputProps = NumericFormatProps<InputProps> & {
  ref?: Ref<HTMLInputElement>
  keepInvalidInput?: boolean
}

export const NumberInput: FC<NumberInputProps> = ({
  ref,
  value,
  keepInvalidInput,
  onValueChange,
  ...props
}) => {
  // string input allows to keep invalid values when typing -> e.g. 200 -> 00 -> 300
  const [inputValue, setInputValue] = useState(value?.toString())

  return (
    <NumericFormat
      {...(keepInvalidInput
        ? {
            value: inputValue,
            onValueChange: (value, source) => {
              setInputValue(value.value)
              onValueChange?.(value, source)
            },
          }
        : {
            value,
            onValueChange,
          })}
      thousandSeparator={String.fromCharCode(160)}
      getInputRef={ref}
      customInput={Input}
      allowedDecimalSeparators={[".", ","]}
      inputMode="decimal"
      {...props}
    />
  )
}
