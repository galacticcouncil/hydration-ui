import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Input,
  ModalBody,
  ModalMounted,
  ModalUnmounted,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components"

import { SOption } from "./AssetSelectModal.styled"

type AssetSelectModalProps = {
  assets: TAssetData[]
  onOpenChange: (value: boolean) => void
  onSelect: (asset: TAssetData) => void
  emptyState?: ReactNode
  open: boolean
}

const Content = ({
  assets,
  open,
  onOpenChange,
  onSelect,
  emptyState,
}: AssetSelectModalProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [highlighted, setHighlighted] = useState(0)

  const filteredAssets = useMemo(() => {
    if (search.length) {
      return assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(search.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return assets
  }, [assets, search])

  const virtualizer = useVirtualizer({
    count: filteredAssets.length,
    getScrollElement: () => divRef.current,
    estimateSize: () => 50,
    overscan: 5,
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSelectOption = (asset: TAssetData) => {
    onSelect(asset)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === "ArrowDown") {
      setHighlighted((prevIndex) => {
        const nextIndex =
          prevIndex < filteredAssets.length - 1 ? prevIndex + 1 : prevIndex
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
      const asset = filteredAssets[highlighted]
      onSelectOption(asset)
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
    <ModalUnmounted
      open={open}
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
    >
      <ModalBody>
        <Box
          ref={divRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          m="calc(-1 * var(--modal-content-padding))"
          sx={{
            height: ["calc(100vh - 120px)", 450],
            outline: "none",
            overflowY: "auto",
          }}
        >
          {filteredAssets.length ? (
            <div
              sx={{
                width: "100%",
                height: virtualizer.getTotalSize(),
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const asset = filteredAssets[virtualRow.index]

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
                    <Text fs="p6" color={getToken("text.medium")}>
                      $1 000
                    </Text>
                  </SOption>
                )
              })}
            </div>
          ) : (
            emptyState
          )}
        </Box>
      </ModalBody>
    </ModalUnmounted>
  )
}

export const AssetSelectModal = (props: AssetSelectModalProps) => {
  return (
    <ModalMounted open={props.open} onOpenChange={props.onOpenChange}>
      <Content {...props} />
    </ModalMounted>
  )
}
