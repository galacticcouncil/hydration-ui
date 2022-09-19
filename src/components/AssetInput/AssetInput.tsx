import { MarginProps, SizeProps } from "utils/styles"
import React, { FC } from "react"
import {
  SDollars,
  SInput,
  SInputWrapper,
  SLabelWrapper,
  SUnit,
} from "./AssetInput.styled"

export type AssetInputProps = {
  value: string
  onChange: (val: string) => void
  name: string
  label: string
  dollars: string
  unit?: string
  type?: string
  placeholder?: string
  error?: string
  withLabel?: boolean
} & SizeProps &
  MarginProps

export const AssetInput: FC<AssetInputProps> = ({
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
    <SLabelWrapper htmlFor={name} error={p.error}>
      <SInputWrapper>
        <SInput
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.validity.valid) {
              onChange(e.target.value.replace(/,/g, "."))
            }
          }}
          value={value ?? ""}
          id={name}
          type={type}
          placeholder={placeholder}
        />

        <SUnit>{p.unit}</SUnit>
      </SInputWrapper>
      <SDollars>{`≈  ${p.dollars}`}</SDollars>
    </SLabelWrapper>
  )
}
