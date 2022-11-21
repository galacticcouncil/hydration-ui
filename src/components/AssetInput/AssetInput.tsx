import React, { FC } from "react"
import { Maybe } from "utils/helpers"
import {
  SDollars,
  SErrorMessage,
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
  dollars?: string
  unit?: Maybe<string>
  type?: string
  placeholder?: string
  error?: string
  withLabel?: boolean
  className?: string
}

export const AssetInput: FC<AssetInputProps> = (props) => {
  return (
    <div
      className={props.className}
      css={{ position: "relative", width: "100%" }}
    >
      <SLabelWrapper error={props.error}>
        <SInputWrapper>
          <SInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.validity.valid) {
                props.onChange(e.target.value.replace(/,/g, "."))
              }
            }}
            value={props.value ?? ""}
            id={props.name}
            type={props.type}
            placeholder={props.placeholder}
          />

          {props.unit && <SUnit>{props.unit}</SUnit>}
        </SInputWrapper>
        {props.dollars && <SDollars>{`≈  ${props.dollars} USD`}</SDollars>}
      </SLabelWrapper>
      {props.error && <SErrorMessage>{props.error}</SErrorMessage>}
    </div>
  )
}
