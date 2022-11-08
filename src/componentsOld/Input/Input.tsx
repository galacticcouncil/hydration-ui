import { Label } from "components/Label/Label"
import React, { FC } from "react"
import { SWrapper, SInput } from "./Input.styled"

// Error handling should be added once we implement forms and validation, for now the input accepts error props

export type InputProps = {
  value: string
  onChange: (val: string) => void
  name: string
  label: string
  unit?: string
  type?: string
  placeholder?: string
  error?: string
  withLabel?: boolean
  className?: string
  //   TODO add optional tooltip once we have tooltip component
  //   tooltip?: { description: string }
}

export const Input: FC<InputProps> = ({
  onChange,
  value,
  label,
  type = "text",
  placeholder,
  name,
  withLabel,
  ...p
}) => {
  return (
    <>
      <Label
        id={name}
        label={label}
        error={p.error}
        withLabel={withLabel}
        {...p}
      >
        <SWrapper unit={p.unit}>
          <SInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            value={value ?? ""}
            id={name}
            type={type}
            error={p.error}
            unit={p.unit}
            placeholder={placeholder}
          />
        </SWrapper>
      </Label>
    </>
  )
}
