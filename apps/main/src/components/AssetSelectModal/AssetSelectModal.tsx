import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Input,
  InputProps,
  Modal,
  ModalBody,
  ModalHeader,
  Skeleton,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"

import { SOption } from "./AssetSelectModal.styled"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
  useFilteredSearchAssets,
} from "./AssetSelectModal.utils"

const VIRTUALIZED_ITEM_HEIGHT = 50

export type AssetSelectProps = {
  assets: TAssetData[]
  sortedAssets?: TAssetWithBalance[]
  selectedAssetId?: string
  onSelect?: (asset: TAssetData) => void
  emptyState?: ReactNode
  searchInputVariant?: InputProps["variant"]
}

export type AssetSelectModalProps = AssetSelectProps & {
  open: boolean
  onOpenChange: (value: boolean) => void
}

const emptyAssets: TAssetData[] = []

export const AssetSelectModalContent = ({
  assets,
  sortedAssets: customSortedAssets,
  onSelect,
  emptyState,
  selectedAssetId,
  searchInputVariant = "embedded",
}: AssetSelectProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [highlighted, setHighlighted] = useState(0)
  const [debouncedSearch] = useDebounce(search, 300)

  const isProvidedSortedAssets =
    customSortedAssets && customSortedAssets.length > 0
  const { sortedAssets, isLoading } = useAssetSelectModalAssets(
    isProvidedSortedAssets ? emptyAssets : assets,
    debouncedSearch,
    selectedAssetId,
  )

  const filteredCustomAssets = useFilteredSearchAssets(
    customSortedAssets ?? [],
    debouncedSearch,
  )

  const assetsToDisplay = isProvidedSortedAssets
    ? filteredCustomAssets
    : sortedAssets

  const onSelectOption = (asset: TAssetData) => {
    onSelect?.(asset)
  }

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === "ArrowDown") {
      setHighlighted((prevIndex) => {
        const nextIndex =
          prevIndex < assetsToDisplay.length - 1 ? prevIndex + 1 : prevIndex
        scrollToHighlighted(nextIndex)
        return nextIndex
      })
    } else if (e.key === "ArrowUp") {
      setHighlighted((prevIndex) => {
        const nextIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex
        scrollToHighlighted(nextIndex)
        return nextIndex
      })
    } else if (e.key === "Backspace") {
      setSearch((prevValue) => prevValue.slice(0, -1))
      inputRef.current?.focus()
    } else if (e.key === "Enter") {
      const asset = assetsToDisplay[highlighted]

      if (asset) {
        onSelectOption(asset)
      }
    }
  }

  const scrollToHighlighted = (index: number) => {
    const element = document.getElementById(`asset-${index}`)
    if (element) {
      element.scrollIntoView({ block: "nearest" })
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault()
      divRef.current?.focus()
      handleKeyDown(e)
    }
  }

  const searchInput = (
    <Input
      placeholder={t("assetSelector.input.placeholder")}
      customSize="medium"
      iconStart={Search}
      value={search}
      onChange={(v) => setSearch(v.target.value)}
      onKeyDown={handleInputKeyDown}
      ref={inputRef}
      variant={searchInputVariant}
      sx={
        searchInputVariant === "embedded"
          ? { flexGrow: 1, px: 0, my: "var(--modal-content-inset)" }
          : {}
      }
    />
  )

  return (
    <>
      {searchInputVariant === "embedded" && (
        <ModalHeader
          title={t("assetSelector.title")}
          customTitle={searchInput}
        />
      )}
      <ModalBody scrollable={false} noPadding>
        {searchInputVariant === "standalone" && (
          <Box p="var(--modal-content-padding)" pb={0}>
            {searchInput}
          </Box>
        )}
        <Box
          ref={divRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          sx={{ outline: "none" }}
        >
          <Flex pt="m" pb="s" px="xxl" justify="space-between" align="center">
            <Text fs="p5" fw={400} color={getToken("text.medium")}>
              {t("asset")}
            </Text>
            <Text fs="p5" fw={400} color={getToken("text.medium")}>
              {t("balance")}
            </Text>
          </Flex>

          {isLoading ? (
            <Flex direction="column" gap="base">
              {[...Array(10)].map((_, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  width="100%"
                  height={VIRTUALIZED_ITEM_HEIGHT}
                  px="xxl"
                >
                  <AssetLabelFull loading />
                  <Text align="right">
                    <Skeleton height="1em" width={40} />
                    <Skeleton height="0.8em" width={30} />
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : assetsToDisplay.length ? (
            <VirtualizedList
              items={assetsToDisplay}
              maxVisibleItems={[null, null, null, 10]}
              itemSize={VIRTUALIZED_ITEM_HEIGHT}
              renderItem={(item, { key, index }) => (
                <SOption
                  id={`asset-${key}`}
                  role="option"
                  highlighted={highlighted === index}
                  onMouseMove={() => setHighlighted(index)}
                  onClick={() => onSelectOption(item)}
                >
                  <AssetLabelFull asset={item} />
                  <Flex direction="column" align="flex-end">
                    <Text fs="p4" fw={500} color={getToken("text.high")}>
                      {t("number", { value: item.balance || "0" })}
                    </Text>
                    <Text fs="p6" fw={400} color={getToken("text.medium")}>
                      {t("currency", { value: item.balanceDisplay || "0" })}
                    </Text>
                  </Flex>
                </SOption>
              )}
            />
          ) : (
            emptyState
          )}
        </Box>
      </ModalBody>
    </>
  )
}

export const AssetSelectModal = ({
  open,
  onOpenChange,
  ...props
}: AssetSelectModalProps) => {
  return (
    <Modal variant="popup" open={open} onOpenChange={onOpenChange}>
      <AssetSelectModalContent
        {...props}
        onSelect={(asset) => {
          props.onSelect?.(asset)
          onOpenChange(false)
        }}
      />
    </Modal>
  )
}
