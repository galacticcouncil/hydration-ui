import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Input,
  Modal,
  ModalBody,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components"

import { SOption } from "./AssetSelectModal.styled"

type AssetSelectModalProps = {
  assets: TAssetData[]
  onOpenChange: (value: boolean) => void
  onSelect: (asset: TAssetData) => void
  emptyState?: ReactNode
}

export const AssetSelectModal = ({
  assets,
  onOpenChange,
  onSelect,
  emptyState,
}: AssetSelectModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")
  const [highlighted, setHighlighted] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
    <Modal
      open
      title="Asset select modal"
      onOpenChange={onOpenChange}
      customTitle={
        <Input
          placeholder="Search tokens..."
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
        <Flex
          ref={divRef}
          tabIndex={0}
          direction="column"
          onKeyDown={handleKeyDown}
          mx="calc(-1 * var(--modal-content-padding))"
          mt="calc(-1 * var(--modal-content-padding))"
          sx={{ minHeight: 360, outline: "none" }}
        >
          {filteredAssets.length
            ? filteredAssets.map((asset, i) => (
                <SOption
                  key={`${asset.id}_${i}`}
                  id={`asset-${i}`}
                  role="option"
                  highlighted={highlighted === i}
                  onMouseMove={() => setHighlighted(i)}
                  onClick={() => onSelectOption(asset)}
                >
                  <AssetLabelFull asset={asset} />
                  <Text fs="p6" color={getToken("text.medium")}>
                    $1 000
                  </Text>
                </SOption>
              ))
            : emptyState}
        </Flex>
      </ModalBody>
    </Modal>
  )
}
