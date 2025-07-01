import { Input } from "@galacticcouncil/ui/components"
import { FC } from "react"

type Props = {
  readonly name: string
  readonly onChange: (name: string) => void
  readonly onCancel: () => void
}

export const AccountNameEdit: FC<Props> = ({ name, onChange, onCancel }) => {
  return (
    <Input
      autoFocus
      defaultValue={name}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur()
        }
      }}
      onBlur={(e) => {
        const value = e.target.value

        if (isValid(value)) {
          onChange(value)
        } else {
          onCancel()
        }
      }}
    />
  )
}

const isValid = (name: string) => name.trim().length > 0
