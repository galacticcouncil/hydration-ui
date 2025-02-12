import { ChevronDown } from "lucide-react"
import { ReactNode } from "react"

import { Flex, Icon, MicroButton, Skeleton, Text } from "@/components"
import { getToken } from "@/utils"

import {
  SAssetButton,
  SAssetButtonEmpty,
  SAssetInput,
} from "./AssetInput.styled"
import { formatAssetValue } from "./AssetInput.utils"

export type AssetInputProps = {
  label?: string
  symbol?: string
  value?: string
  dollarValue?: string
  maxBalance?: string
  onChange: (value: string) => void
  onAsssetBtnClick?: () => void
  error?: string
  disabled?: boolean
  loading?: boolean
  selectedAssetIcon?: ReactNode
}

export const AssetInput = ({
  symbol,
  selectedAssetIcon,
  value,
  dollarValue,
  label,
  maxBalance,
  onChange,
  error,
  disabled,
  loading,
  onAsssetBtnClick,
}: AssetInputProps) => {
  const onMaxButtonClick = () => {
    if (maxBalance) onChange(maxBalance)
  }

  return (
    <Flex direction="column" gap={12} sx={{ position: "relative", py: 20 }}>
      <Flex align="center" gap={4} justify="space-between">
        {label && (
          <Text
            color={getToken("text.medium")}
            fs="p5"
            fw={500}
            sx={{ width: "fit-content", lineHeight: "120%" }}
          >
            {label}
          </Text>
        )}
        <Flex align="center" gap={6} sx={{ marginLeft: "auto" }}>
          <Text
            as="div"
            color={getToken("text.low")}
            fs="p5"
            fw={500}
            sx={{ width: "fit-content", lineHeight: "120%" }}
          >
            <span>Balance: </span>
            {loading ? (
              <span sx={{ height: 12, lineHeight: 1 }}>
                <Skeleton width={48} height={12} />
              </span>
            ) : (
              <span>{formatAssetValue(maxBalance) ?? "0"}</span>
            )}
          </Text>
          <MicroButton
            aria-label="Max balance button"
            onClick={onMaxButtonClick}
            disabled={!maxBalance || maxBalance === "0" || loading}
          >
            max
          </MicroButton>
        </Flex>
      </Flex>
      <Flex direction="column">
        <Flex align="center" justify="space-between">
          <AssetButton
            symbol={symbol}
            icon={selectedAssetIcon}
            loading={loading}
            error={!!error}
            onAsssetBtnClick={onAsssetBtnClick}
          />
          <Flex
            direction="column"
            height={38}
            justify="space-evenly"
            align="end"
          >
            <SAssetInput
              isError={!!error}
              placeholder="0"
              variant="embedded"
              disabled={disabled || loading}
              value={formatAssetValue(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.validity.valid) {
                  const formattedValue = e.target.value
                    .replace(/\s+/g, "")
                    .replace(/,/g, ".")

                  if (!isNaN(Number(formattedValue))) {
                    onChange(formattedValue)
                  }
                }
              }}
            />

            <Text
              color={getToken("text.low")}
              fs={10}
              fw={400}
              sx={{ width: "fit-content" }}
            >
              ${dollarValue ? formatAssetValue(dollarValue) : "0"}
            </Text>
          </Flex>
        </Flex>
        {error && (
          <Text
            fs={12}
            font="secondary"
            fw={400}
            color={getToken("accents.danger.secondary")}
            sx={{ marginLeft: "auto", lineHeight: 1 }}
          >
            {error}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

const AssetButton = ({
  loading,
  symbol,
  error,
  icon,
  onAsssetBtnClick,
}: {
  loading?: boolean
  symbol?: string
  icon?: ReactNode
  error: boolean
  onAsssetBtnClick?: () => void
}) => {
  if (loading)
    return (
      <Flex direction="column" height={38} gap={2} justify="center">
        <div sx={{ height: 12, lineHeight: 1 }}>
          <Skeleton width={24} height={12} />
        </div>
        <div sx={{ height: 12, lineHeight: 1 }}>
          <Skeleton width={48} height={12} />
        </div>
      </Flex>
    )

  if (symbol && icon)
    return (
      <SAssetButton isError={!!error} onClick={onAsssetBtnClick}>
        {icon}
        <Flex align="center" gap={4}>
          <Text
            color={getToken("text.high")}
            fw={600}
            fs="p3"
            sx={{ whiteSpace: "nowrap" }}
          >
            {symbol}
          </Text>
          <Icon
            size={20}
            component={ChevronDown}
            color={getToken("icons.onContainer")}
          />
        </Flex>
      </SAssetButton>
    )

  return (
    <SAssetButtonEmpty variant="secondary" onClick={onAsssetBtnClick}>
      <Text fw={600} fs="p3" sx={{ whiteSpace: "nowrap" }}>
        Select asset
      </Text>
      <Icon size={20} component={ChevronDown} />
    </SAssetButtonEmpty>
  )
}
