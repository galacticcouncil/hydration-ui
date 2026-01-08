import {
  AssetInput as BaseAssetInput,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { CapType } from "@/types"

export interface Asset {
  balance?: string
  symbol: string
  iconSymbol?: string
  address: string
  aToken?: boolean
  priceInUsd?: string
  decimals?: number
}

export interface AssetInputProps<T extends Asset = Asset> {
  name: string
  value: string
  usdValue: string
  symbol: string
  onChange?: (value: string) => void
  disabled?: boolean
  disableInput?: boolean
  onSelect?: (asset: T) => void
  assets: T[]
  capType?: CapType
  maxValue?: string
  isMaxSelected?: boolean
  inputTitle?: React.ReactNode
  balanceText?: React.ReactNode
  loading?: boolean
  className?: string
  error?: string
}

export const AssetInput = <T extends Asset = Asset>({
  value,
  symbol,
  onChange,
  onSelect,
  assets,
  maxValue,
  loading = false,
  className,
  error,
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
        maxBalance={maxValue}
        selectedAssetIcon={<ReserveLogo address={asset.address} />}
        onAsssetBtnClick={
          hasMultipleAssets ? () => setIsAssetSelectOpen(true) : undefined
        }
        modalDisabled={!hasMultipleAssets}
        onChange={onChange}
        loading={loading}
        error={error}
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
                py={12}
                px="var(--modal-content-padding)"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  onSelect?.(asset)
                  onChange?.("")
                  setIsAssetSelectOpen(false)
                }}
              >
                <Flex align="center" gap={8}>
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
