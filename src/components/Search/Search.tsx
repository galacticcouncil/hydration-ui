import { forwardRef } from "react"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { Input } from "components/Input/Input"
import { SSearchContainer } from "./Seach.styled"

interface SeachProps extends React.ComponentProps<"input"> {
  value: string
  setValue: (value: string) => void
  className?: string
}

export const Search = forwardRef<HTMLInputElement, SeachProps>(
  ({ value, className, setValue, ...p }, ref) => {
    return (
      <SSearchContainer className={className}>
        <IconSearch />
        <Input
          {...p}
          ref={ref}
          value={value}
          onChange={setValue}
          name="search"
          placeholder={p.placeholder}
        />
      </SSearchContainer>
    )
  },
)
