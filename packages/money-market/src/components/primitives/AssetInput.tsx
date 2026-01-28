import {
  AssetInput as BaseAssetInput,
  AssetInputProps as BaseAssetInputProps,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isValidBigSource } from "@galacticcouncil/utils"
import { useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

export interface Asset {
  balance?: string
  symbol: string
  iconSymbol?: string
  address: string
  aToken?: boolean
  priceInUsd?: string
  decimals?: number
}

export interface AssetInputOwnProps<T extends Asset = Asset> {
  symbol: string
  onChange?: (value: string) => void
  onSelect?: (asset: T) => void
  assets: T[]
}

export type AssetInputProps<T extends Asset = Asset> = AssetInputOwnProps<T> &
  BaseAssetInputProps

export const AssetInput = <T extends Asset = Asset>({
  value,
  symbol,
  onChange,
  onSelect,
  assets,
  maxButtonBalance,
  loading = false,
  className,
  assetError,
  amountError,
  disabled,
  balanceLabel,
  displayValue,
}: AssetInputProps<T>) => {
  const { formatCurrency } = useAppFormatters()
  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)
  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === symbol) as T)

  const hasMultipleAssets = assets.length > 1

  return (
    <>
      <BaseAssetInput
        sx={{ pt: 0 }}
        className={className}
        label="Amount"
        symbol={symbol}
        value={value}
        displayValue={
          isValidBigSource(displayValue)
            ? formatCurrency(displayValue.toString())
            : undefined
        }
        maxBalance={asset.balance}
        maxButtonBalance={maxButtonBalance}
        disabled={disabled}
        balanceLabel={balanceLabel}
        selectedAssetIcon={<ReserveLogo address={asset.address} />}
        onAsssetBtnClick={
          hasMultipleAssets ? () => setIsAssetSelectOpen(true) : undefined
        }
        modalDisabled={!hasMultipleAssets}
        onChange={onChange}
        loading={loading}
        assetError={assetError}
        amountError={amountError}
      />
      <Modal open={isAssetSelectOpen} onOpenChange={setIsAssetSelectOpen}>
        <ModalHeader title="Select asset" />
        <ModalBody sx={{ p: 0 }}>
          <Stack separated>
            {assets.map((asset) => (
              <Flex
                align="center"
                justify="space-between"
                key={asset.address}
                py="m"
                px="var(--modal-content-padding)"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  onSelect?.(asset)
                  onChange?.("")
                  setIsAssetSelectOpen(false)
                }}
              >
                <Flex align="center" gap="base">
                  <ReserveLogo address={asset.address} />
                  <Text color={getToken("text.high")} fs="p5" fw={600} lh={1}>
                    {asset.symbol}
                  </Text>
                </Flex>
                <Flex direction="column" align="flex-end">
                  <Text fs="p4" fw={500} color={getToken("text.high")}>
                    {formatCurrency(asset.balance, { symbol: asset.symbol })}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Stack>
        </ModalBody>
      </Modal>
    </>
  )
}
