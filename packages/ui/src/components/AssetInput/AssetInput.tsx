import { ChevronDown } from "lucide-react"
import { ReactNode } from "react"

import { MicroButton } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { LogoSkeleton } from "@/components/Logo"
import { Skeleton } from "@/components/Skeleton"
import { pxToRem } from "@/utils"

import {
  SAmount,
  SAmountInput,
  SAssetButton,
  SBalance,
  SBalanceText,
  SHeader,
  SLabel,
  SOverlay,
  SRoot,
  SSubline,
} from "./AssetInput.styled"
import { defaultAssetValueFormatter } from "./AssetInput.utils"

export type AssetInputAsset = {
  symbol: string
  icon: ReactNode
}

export type AssetInputBalance = {
  label: string
  value: ReactNode
  isLoading?: boolean
  onMax?: (() => void) | null
  isMaxDisabled?: boolean
}

export type AssetInputProps = {
  label?: ReactNode
  asset?: AssetInputAsset | null
  onAssetClick?: () => void
  selectAssetLabel?: string
  value?: string
  onChange?: (value: string) => void
  displayValue?: ReactNode
  balance?: AssetInputBalance
  assetError?: string
  amountError?: string
  isLoading?: boolean
  isValueLoading?: boolean
  isDisplayValueLoading?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  isAmountHidden?: boolean
  className?: string
}

export const AssetInput = ({
  label,
  asset,
  onAssetClick,
  selectAssetLabel,
  value,
  onChange,
  displayValue,
  balance,
  assetError,
  amountError,
  isLoading = false,
  isValueLoading = false,
  isDisplayValueLoading = false,
  isDisabled = false,
  isReadOnly = false,
  isAmountHidden = false,
  className,
}: AssetInputProps) => {
  const isValueBusy = isLoading || isValueLoading
  const error = isLoading ? undefined : (amountError ?? assetError)

  return (
    <SRoot isAmountHidden={isAmountHidden} className={className}>
      {(label || balance) && (
        <SHeader>
          {label && <SLabel>{label}</SLabel>}
          {balance && (
            <AssetInputBalanceView
              {...balance}
              isLoading={isLoading || balance.isLoading}
              isDisabled={isDisabled}
            />
          )}
        </SHeader>
      )}

      <AssetButton
        asset={asset}
        onClick={onAssetClick}
        selectAssetLabel={selectAssetLabel}
        isLoading={isLoading}
        isError={!!assetError && !isLoading}
        isDisabled={isDisabled}
      />

      {!isAmountHidden && (
        <SAmount>
          <SAmountInput
            variant="embedded"
            placeholder="0"
            autoComplete="off"
            inputMode="decimal"
            aria-busy={isValueBusy}
            isError={!!amountError && !isLoading}
            disabled={isDisabled}
            readOnly={isReadOnly || isValueBusy || !onChange}
            value={defaultAssetValueFormatter(value ?? "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.validity.valid) return

              const formattedValue = e.target.value
                .replace(/\s+/g, "")
                .replace(/,/g, ".")

              if (!isNaN(Number(formattedValue))) {
                onChange?.(formattedValue)
              }
            }}
          />
          {isValueBusy && (
            <SOverlay>
              <Skeleton width={pxToRem(64)} height={pxToRem(20)} />
            </SOverlay>
          )}
        </SAmount>
      )}

      <SSubline isError={!!error}>
        {error ??
          (isLoading || isDisplayValueLoading ? (
            <Skeleton width={pxToRem(48)} height={pxToRem(10)} />
          ) : (
            displayValue
          ))}
      </SSubline>
    </SRoot>
  )
}

const AssetInputBalanceView = ({
  label,
  value,
  isLoading,
  onMax,
  isMaxDisabled,
  isDisabled,
}: AssetInputBalance & { isDisabled: boolean }) => (
  <SBalance>
    <SBalanceText>
      {label}:{" "}
      {isLoading ? <Skeleton width={pxToRem(64)} height="1em" inline /> : value}
    </SBalanceText>
    {onMax && (
      <MicroButton
        onClick={onMax}
        disabled={isLoading || isDisabled || isMaxDisabled}
      >
        max
      </MicroButton>
    )}
  </SBalance>
)

export type AssetButtonProps = {
  asset?: AssetInputAsset | null
  onClick?: () => void
  selectAssetLabel?: string
  isLoading?: boolean
  isError?: boolean
  isDisabled?: boolean
  className?: string
}

export const AssetButton = ({
  asset,
  onClick,
  selectAssetLabel = "Select asset",
  isLoading = false,
  isError = false,
  isDisabled = false,
  className,
}: AssetButtonProps) => {
  const isInteractive = !!onClick && !isDisabled && !isLoading

  return (
    <SAssetButton
      type="button"
      className={className}
      isEmpty={!asset && !isLoading}
      isError={isError}
      disabled={!isInteractive}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <LogoSkeleton size="medium" />
          <Skeleton width={pxToRem(48)} height="1em" />
        </>
      ) : asset ? (
        <>
          {asset.icon}
          {asset.symbol}
        </>
      ) : (
        selectAssetLabel
      )}
      {isInteractive && <Icon size="s" component={ChevronDown} />}
    </SAssetButton>
  )
}
