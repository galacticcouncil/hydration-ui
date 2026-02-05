import { formatNumber } from "@galacticcouncil/utils"
import Big from "big.js"
import { ChevronDown } from "lucide-react"
import { ReactNode } from "react"

import { Flex, Icon, MicroButton, Skeleton, Text } from "@/components"
import { FormError } from "@/components/FormError"
import { getToken } from "@/utils"

import {
  SAssetButton,
  SAssetButtonEmpty,
  SAssetInput,
} from "./AssetInput.styled"
import { defaultAssetValueFormatter } from "./AssetInput.utils"

export type AssetInputProps = {
  label?: string
  balanceLabel?: string
  symbol?: string
  value?: string
  displayValue?: string
  displayValueLoading?: boolean
  maxBalance?: string
  maxButtonBalance?: string
  ignoreBalance?: boolean
  ignoreDisplayValue?: boolean
  hideMaxBalanceAction?: boolean
  assetError?: string
  amountError?: string
  disabled?: boolean
  disabledInput?: boolean
  hideInput?: boolean
  modalDisabled?: boolean
  loading?: boolean
  selectedAssetIcon?: ReactNode
  onChange?: (value: string) => void
  onAsssetBtnClick?: () => void
  className?: string
}

export const AssetInput = ({
  symbol,
  selectedAssetIcon,
  value,
  displayValue,
  displayValueLoading,
  label,
  balanceLabel,
  maxBalance,
  maxButtonBalance,
  ignoreBalance,
  ignoreDisplayValue,
  hideMaxBalanceAction,
  onChange,
  assetError,
  amountError,
  disabled,
  disabledInput,
  hideInput,
  modalDisabled,
  loading,
  onAsssetBtnClick,
  className,
}: AssetInputProps) => {
  const usedMaxBalance = maxButtonBalance || maxBalance

  const onMaxButtonClick = () => {
    if (usedMaxBalance) onChange?.(usedMaxBalance)
  }

  const errorMessage = assetError ?? amountError

  return (
    <Flex
      direction="column"
      gap="m"
      sx={{ position: "relative", py: 20, overflow: "hidden" }}
      className={className}
    >
      <Flex align="center" gap="s" justify="space-between">
        {label && (
          <Text
            color={getToken("text.medium")}
            fs="p5"
            fw={500}
            sx={{
              width: "fit-content",
              lineHeight: "120%",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Text>
        )}
        {!ignoreBalance && (
          <Flex align="center" gap="s" sx={{ marginLeft: "auto" }}>
            <Text
              as="div"
              color={getToken("text.low")}
              fs="p5"
              fw={500}
              sx={{
                width: "fit-content",
                lineHeight: "120%",
                whiteSpace: "nowrap",
              }}
            >
              <span>{balanceLabel ?? "Balance"}: </span>
              {loading ? (
                <span sx={{ height: 12, lineHeight: 1 }}>
                  <Skeleton width={48} height={12} />
                </span>
              ) : (
                <span>{maxBalance ? formatNumber(maxBalance) : ""}</span>
              )}
            </Text>
            {!hideMaxBalanceAction && (
              <MicroButton
                aria-label="Max balance button"
                onClick={onMaxButtonClick}
                disabled={
                  Big(usedMaxBalance || "0").lte(0) ||
                  loading ||
                  !onChange ||
                  !!disabled
                }
              >
                max
              </MicroButton>
            )}
          </Flex>
        )}
      </Flex>
      <Flex direction="column">
        <Flex align="center" justify="space-between" gap="m">
          <AssetButton
            sx={{ ...(hideInput && { flex: 1 }) }}
            symbol={symbol}
            icon={selectedAssetIcon}
            loading={loading}
            error={!!assetError}
            onAsssetBtnClick={onAsssetBtnClick}
            disabled={!!modalDisabled || !!disabled}
          />
          {!hideInput && (
            <Flex
              direction="column"
              height="2.375rem"
              justify="space-evenly"
              align="end"
              flex={1}
            >
              <SAssetInput
                isError={!!amountError}
                placeholder="0"
                variant="embedded"
                autoComplete="off"
                inputMode="decimal"
                disabled={disabled || loading || !onChange || disabledInput}
                value={defaultAssetValueFormatter(value ?? "")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.validity.valid) {
                    const formattedValue = e.target.value
                      .replace(/\s+/g, "")
                      .replace(/,/g, ".")

                    if (!isNaN(Number(formattedValue))) {
                      onChange?.(formattedValue)
                    }
                  }
                }}
              />

              {!ignoreDisplayValue && (
                <Text
                  color={getToken("text.low")}
                  fs="p6"
                  fw={400}
                  sx={{ width: "fit-content" }}
                >
                  {displayValueLoading ? <Skeleton width={48} /> : displayValue}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
        {errorMessage && (
          <FormError lh={1} ml="auto">
            {errorMessage}
          </FormError>
        )}
      </Flex>
    </Flex>
  )
}

export const AssetButton = ({
  loading,
  symbol,
  error,
  icon,
  disabled,
  className,
  onAsssetBtnClick,
}: {
  loading?: boolean
  symbol?: string
  icon?: ReactNode
  error: boolean
  disabled?: boolean
  className?: string
  onAsssetBtnClick?: () => void
}) => {
  if (loading)
    return (
      <Flex
        direction="column"
        height="2.375rem"
        gap="xs"
        justify="center"
        className={className}
      >
        <div sx={{ height: "xs", lineHeight: 1 }}>
          <Skeleton sx={{ width: "m", height: "xs" }} />
        </div>
        <div sx={{ height: "xs", lineHeight: 1 }}>
          <Skeleton sx={{ width: "100%", minWidth: "xl", height: "xs" }} />
        </div>
      </Flex>
    )

  if (symbol && icon)
    return (
      <SAssetButton
        className={className}
        type="button"
        disabled={!!disabled}
        isError={!!error}
        onClick={onAsssetBtnClick}
      >
        {icon}
        <Flex flex={1} align="center" gap="s" justify="space-between">
          <Text
            color={getToken("text.high")}
            fw={600}
            fs="p3"
            whiteSpace="nowrap"
          >
            {symbol}
          </Text>
          {onAsssetBtnClick && (
            <Icon
              size="s"
              mr="-base"
              component={ChevronDown}
              color={getToken("icons.onContainer")}
            />
          )}
        </Flex>
      </SAssetButton>
    )

  return (
    <SAssetButtonEmpty
      variant="secondary"
      sx={{ justifyContent: "space-between" }}
      className={className}
      onClick={onAsssetBtnClick}
    >
      <Text fw={600} fs="p3" whiteSpace="nowrap">
        Select asset
      </Text>
      {!disabled && <Icon size="s" component={ChevronDown} />}
    </SAssetButtonEmpty>
  )
}
