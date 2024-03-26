import BigNumber from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import React, { FC } from "react"
import { formatAssetValue } from "utils/formatting"
import { Maybe } from "utils/helpers"
import {
  SDollars,
  SInput,
  SInputWrapper,
  SLabelWrapper,
  SUnit,
} from "./AssetInput.styled"

export type AssetInputProps = {
  value: Maybe<string>
  onBlur?: (val: string) => void
  onChange: (val: string) => void
  name: string
  label: string
  displayValue?: BigNumber | 0 | null
  unit?: Maybe<string>
  type?: string
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
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
            onBlur={() => props.onBlur?.(props.value ?? "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.validity.valid) {
                props.onChange(
                  e.target.value.replace(/\s+/g, "").replace(/,/g, "."),
                )
              }
            }}
            value={formatAssetValue(props.value ?? "")}
            id={props.name}
            type={props.type}
            placeholder={props.placeholder}
            disabled={props.disabled}
          />

          {props.unit && <SUnit>{props.unit}</SUnit>}
        </SInputWrapper>
        {props.displayValue != null ? (
          <SDollars>
            ≈ <DisplayValue value={props.displayValue} />
          </SDollars>
        ) : null}
      </SLabelWrapper>
    </div>
  )
}
