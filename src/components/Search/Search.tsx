import { forwardRef } from "react"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { Input, InputProps } from "components/Input/Input"
import { SSearchContainer } from "./Seach.styled"

type Props = Omit<InputProps, "name"> & {
  readonly name?: string
}

export const Search = forwardRef<HTMLInputElement, Props>(
  ({ className, name, ...p }, ref) => {
    return (
      <SSearchContainer className={className}>
        <IconSearch />
        <Input ref={ref} name={name ?? "search"} {...p} />
      </SSearchContainer>
    )
  },
)
