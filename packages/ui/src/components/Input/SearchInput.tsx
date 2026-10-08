import { FC, MouseEvent } from "react"

import { CircleX, Search } from "@/assets/icons"

import { Input, InputProps } from "./Input"
import { SInputClear } from "./Input.styled"

export type SearchInputProps = Omit<
  InputProps,
  "iconStart" | "leadingElement" | "iconEnd" | "unit" | "trailingElement"
> & {
  clearLabel?: string
}

// The native value setter plus an "input" event is what makes React fire onChange,
// so the same button clears controlled and uncontrolled inputs without a ref or state
const clear = (e: MouseEvent<HTMLButtonElement>) => {
  const input = e.currentTarget.parentElement?.querySelector("input")
  if (!input) return

  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, "")
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.focus()
}

export const SearchInput: FC<SearchInputProps> = ({
  clearLabel = "Clear",
  // the clear button shows through :placeholder-shown, which needs a placeholder to exist
  placeholder = " ",
  ...props
}) => (
  <Input
    placeholder={placeholder}
    {...props}
    iconStart={Search}
    trailingElement={
      <SInputClear type="button" aria-label={clearLabel} onClick={clear}>
        <CircleX />
      </SInputClear>
    }
  />
)
