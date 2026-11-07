import {
  AssetInput as BaseAssetInput,
  AssetInputProps as BaseAssetInputProps,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatNumber, isValidBigSource } from "@galacticcouncil/utils"
import Big from "big.js"
import { useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

export interface Asset {
  balance?: string
  symbol: string
  iconSymbol?: string
  address: string
  aToken?: boolean
  priceInUsd?: string
  decimals?: number
}

export type AssetInputProps<T extends Asset = Asset> = Omit<
  BaseAssetInputProps,
  "asset" | "onAssetClick" | "balance" | "displayValue"
> & {
  symbol: string
  assets: T[]
  onSelect?: (asset: T) => void
  displayValue?: string
  maxButtonBalance?: string
  balanceLabel?: string
  hideMaxBalanceAction?: boolean
}

export const AssetInput = <T extends Asset = Asset>({
  symbol,
  assets,
  onSelect,
  displayValue,
  maxButtonBalance,
  balanceLabel,
  hideMaxBalanceAction,
  label = "Amount",
  ...props
}: AssetInputProps<T>) => {
  const { formatCurrency } = useAppFormatters()
  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)
  const asset =
    assets.length === 1
      ? assets[0]
      : assets.find((asset) => asset.symbol === symbol)

  const hasMultipleAssets = assets.length > 1
  const max = maxButtonBalance || asset?.balance || "0"

  return (
    <>
      <Box pb="l" width="100%">
        <BaseAssetInput
          {...props}
          label={label}
          asset={{
            symbol,
            icon: asset && <ReserveLogo address={asset.address} />,
          }}
          onAssetClick={
            hasMultipleAssets ? () => setIsAssetSelectOpen(true) : undefined
          }
          displayValue={
            isValidBigSource(displayValue)
              ? formatCurrency(displayValue.toString())
              : undefined
          }
          balance={{
            label: balanceLabel ?? "Balance",
            value: asset?.balance ? formatNumber(asset.balance) : "",
            onMax: hideMaxBalanceAction ? null : () => props.onChange?.(max),
            isMaxDisabled: !props.onChange || Big(max).lte(0),
          }}
        />
      </Box>
      <Modal open={isAssetSelectOpen} onOpenChange={setIsAssetSelectOpen}>
        <ModalHeader title="Select asset" />
        <ModalBody noPadding>
          <VirtualizedList
            items={assets}
            itemSize={ASSET_ITEM_HEIGHT}
            maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
            getItemKey={(index) => assets[index].address}
            renderItem={(asset) => (
              <Flex
                align="center"
                justify="space-between"
                py="m"
                px="var(--modal-content-padding)"
                sx={{
                  cursor: "pointer",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid",
                  borderColor: getToken("details.separators"),
                  "&:hover": {
                    background: getToken("surfaces.containers.dim.dimOnBg"),
                  },
                }}
                onClick={() => {
                  onSelect?.(asset)
                  props.onChange?.("")
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
            )}
          />
        </ModalBody>
      </Modal>
    </>
  )
}
