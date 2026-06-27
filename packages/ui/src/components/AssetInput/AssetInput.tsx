import { formatNumber } from "@galacticcouncil/utils"
import Big from "big.js"
import { ChevronDown } from "lucide-react"
import { ReactNode } from "react"

import { Flex, Icon, MicroButton, Skeleton, Text } from "@/components"
import { FormError } from "@/components/FormError"
import { getToken, pxToRem } from "@/utils"

import {
  SAssetButton,
  SAssetButtonEmpty,
  SAssetInput,
} from "./AssetInput.styled"
import { defaultAssetValueFormatter } from "./AssetInput.utils"

export type AssetInputProps = {
  label?: ReactNode
  balanceLabel?: string
  symbol?: string
  value?: string
  valueLoading?: boolean
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
  valueLoading,
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

  const isLoading = valueLoading || displayValueLoading || loading

  return (
    <Flex
      direction="column"
      gap="m"
      py="l"
      sx={{ position: "relative", overflow: "hidden" }}
      className={className}
    >
      <Flex align="center" gap="s" justify="space-between">
        {label &&
          (typeof label === "string" ? (
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
          ) : (
            label
          ))}
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
        <Flex
          sx={{ overflowX: "hidden" }}
          align="center"
          justify="space-between"
          gap="m"
        >
          <AssetButton
            sx={{ ...(hideInput && { flex: 1 }) }}
            symbol={symbol}
            icon={selectedAssetIcon}
            loading={loading}
            error={!!assetError && !isLoading}
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
              sx={{ minWidth: 0, overflow: "hidden" }}
            >
              {valueLoading ? (
                <Skeleton sx={{ width: "3xl" }} height="1em" />
              ) : (
                <SAssetInput
                  isError={!!amountError && !isLoading}
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
              )}

              {amountError && !isLoading ? (
                <FormError lh={1} truncate width="100%" align="right">
                  {amountError}
                </FormError>
              ) : (
                !ignoreDisplayValue && (
                  <Text
                    color={getToken("text.low")}
                    fs="p6"
                    fw={400}
                    truncate
                    width="100%"
                    align="right"
                  >
                    {displayValueLoading ? (
                      <Skeleton width={48} />
                    ) : (
                      displayValue
                    )}
                  </Text>
                )
              )}
            </Flex>
          )}
        </Flex>
        {assetError && !isLoading && (
          <FormError lh={1} ml="auto">
            {assetError}
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
      <div sx={{ height: pxToRem(34), lineHeight: 1 }}>
        <Skeleton sx={{ width: pxToRem(80), height: pxToRem(34) }} />
      </div>
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
