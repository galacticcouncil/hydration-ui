import { forwardRef } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

import { Input, InputProps } from "./Input"

/**
 * For detailed props documentation
 * @see https://s-yadav.github.io/react-number-format/docs/numeric_format
 */
export type NumberInputProps = NumericFormatProps<InputProps>

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => (
    <NumericFormat
      thousandSeparator={String.fromCharCode(160)}
      getInputRef={ref}
      customInput={Input}
      allowedDecimalSeparators={[".", ","]}
      {...props}
    />
  ),
)
NumberInput.displayName = "NumberInput"
