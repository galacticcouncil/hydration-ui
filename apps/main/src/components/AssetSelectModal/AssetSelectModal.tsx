import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components"

import { SOption } from "./AssetSelectModal.styled"
import { useAssetSelectModalAssets } from "./AssetSelectModal.utils"

type AssetSelectModalProps = {
  assets: TAssetData[]
  selectedAssetId?: string
  onOpenChange: (value: boolean) => void
  onSelect?: (asset: TAssetData) => void
  emptyState?: ReactNode
  open: boolean
}

const Content = ({
  assets,
  onOpenChange,
  onSelect,
  emptyState,
  selectedAssetId,
}: AssetSelectModalProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [highlighted, setHighlighted] = useState(0)

  const { sortedAssets, isLoading } = useAssetSelectModalAssets(
    assets,
    search,
    selectedAssetId,
  )

  const virtualizer = useVirtualizer({
    count: sortedAssets.length,
    getScrollElement: () => divRef.current,
    estimateSize: () => 50,
    overscan: 5,
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSelectOption = (asset: TAssetData) => {
    onSelect?.(asset)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === "ArrowDown") {
      setHighlighted((prevIndex) => {
        const nextIndex =
          prevIndex < sortedAssets.length - 1 ? prevIndex + 1 : prevIndex
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
      const asset = sortedAssets[highlighted]

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

  return (
    <>
      <ModalHeader
        title={t("assetSelector.title")}
        customTitle={
          <Input
            placeholder={t("assetSelector.input.placeholder")}
            variant="embedded"
            customSize="medium"
            iconStart={Search}
            value={search}
            onChange={(v) => setSearch(v.target.value)}
            onKeyDown={handleInputKeyDown}
            ref={inputRef}
            css={{ flexGrow: 1 }}
          />
        }
      />
      <ModalBody>
        <Box
          ref={divRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          m="var(--modal-content-inset)"
          sx={{
            height: ["calc(100vh - 120px)", 450],
            outline: "none",
            overflowY: "auto",
          }}
        >
          <Flex
            pt={getTokenPx("scales.paddings.m")}
            pb={getTokenPx("scales.paddings.s")}
            px={getTokenPx("containers.paddings.primary")}
            justify="space-between"
            align="center"
          >
            <Text fs="p5" fw={400} color={getToken("text.medium")}>
              {t("asset")}
            </Text>
            <Text fs="p5" fw={400} color={getToken("text.medium")}>
              {t("balance")}
            </Text>
          </Flex>

          {isLoading ? (
            <Flex direction="column" gap={10}>
              {[...Array(8)].map((_, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  px={getTokenPx("containers.paddings.primary")}
                >
                  <AssetLabelFull loading />
                  <Skeleton width={50} height={20} />
                </Flex>
              ))}
            </Flex>
          ) : sortedAssets.length ? (
            <div
              sx={{
                width: "100%",
                height: virtualizer.getTotalSize(),
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const asset = sortedAssets[virtualRow.index]

                if (!asset) {
                  return null
                }

                return (
                  <SOption
                    key={virtualRow.key}
                    id={`asset-${virtualRow.key}`}
                    role="option"
                    highlighted={highlighted === virtualRow.index}
                    onMouseMove={() => setHighlighted(virtualRow.index)}
                    onClick={() => onSelectOption(asset)}
                    sx={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <AssetLabelFull asset={asset} />
                    <Flex direction="column" align="flex-end">
                      <Text fs="p4" fw={500} color={getToken("text.high")}>
                        {t("number", { value: asset.balance })}
                      </Text>
                      <Text fs="p6" fw={400} color={getToken("text.medium")}>
                        {t("currency", { value: asset.balanceDisplay })}
                      </Text>
                    </Flex>
                  </SOption>
                )
              })}
            </div>
          ) : (
            emptyState
          )}
        </Box>
      </ModalBody>
    </>
  )
}

export const AssetSelectModal = (props: AssetSelectModalProps) => {
  return (
    <Modal open={props.open} onOpenChange={props.onOpenChange}>
      <Content {...props} />
    </Modal>
  )
}
