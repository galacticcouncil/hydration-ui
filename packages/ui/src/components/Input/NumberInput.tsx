import { FC, Ref, useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

import { Input, InputProps } from "./Input"

/**
 * For detailed props documentation
 * @see https://s-yadav.github.io/react-number-format/docs/numeric_format
 */
export type NumberInputProps = Omit<
  NumericFormatProps<InputProps>,
  "isAllowed"
> & {
  ref?: Ref<HTMLInputElement>
  keepInvalidInput?: boolean
}

export const NumberInput: FC<NumberInputProps> = (props) => {
  const {
    ref,
    value,
    keepInvalidInput,
    onValueChange,
    allowNegative = true,
    ...rest
  } = props

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
      allowNegative={allowNegative}
      isAllowed={(values) => {
        const s = values.value.replace(/\s+/g, "").replace(/,/g, ".")
        if (s === "") return true
        // disallow minus sign if negative number is not allowed
        if (s === "-") return allowNegative
        // disallow invalid numbers
        return Number.isFinite(Number(s))
      }}
      {...rest}
    />
  )
}
