import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"

import { AssetList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/AssetList"
import { ChainAssetSelectButton } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/ChainAssetSelectButton"
import { ChainList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/ChainList"
import {
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"

export type ChainAssetSelectModalProps = {
  title: string
  disabled?: boolean
  chainAssetPairs: XcChainAssetPair[]
  currentSelection: XcChainAssetPair | null
  onAssetSelect: (selection: XcChainAssetPair) => void
}

export type ChainAssetSelectDialogProps = ChainAssetSelectModalProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ChainAssetSelectDialog: React.FC<ChainAssetSelectDialogProps> = ({
  open,
  onOpenChange,
  title,
  onAssetSelect,
  ...props
}) => {
  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onOpenChange}
      disableInteractOutside
    >
      <ModalHeader align="center" title={title} />
      <ModalBody scrollable={false} noPadding>
        <ChainAssetSelectContent
          {...props}
          title={title}
          onAssetSelect={(selection) => {
            onAssetSelect(selection)
            onOpenChange(false)
          }}
        />
      </ModalBody>
    </Modal>
  )
}

export const ChainAssetSelectModal: React.FC<ChainAssetSelectModalProps> = (
  props,
) => {
  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <ChainAssetSelectButton
          currentSelection={props.currentSelection}
          disabled={props.disabled}
        />
      </ModalTrigger>
      <ModalContent onInteractOutside={(e) => e.preventDefault()}>
        <ModalHeader align="center" title={props.title} />
        <ModalBody scrollable={false} noPadding>
          <ChainAssetSelectContent {...props} />
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  )
}

export const ChainAssetSelectContent: React.FC<ChainAssetSelectModalProps> = ({
  chainAssetPairs,
  currentSelection,
  onAssetSelect,
}) => {
  const { isMobile } = useBreakpoints()
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [pendingChain, setPendingChain] = useState<XcChain>(
    currentSelection?.chain ?? chainAssetPairs[0]!.chain,
  )

  const filteredChains = chainAssetPairs
    .map(({ chain }) => chain)
    .filter(
      (chain) =>
        chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
        chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
    )

  const filteredAssets = chainAssetPairs
    .filter(({ chain }) => chain.key === pendingChain.key)
    .map(({ asset }) => asset)
    .filter((asset) =>
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()),
    )

  return (
    <>
      <Grid
        columnTemplate={["9rem 1fr", "10.25rem 1fr"]}
        gap={["base", "l"]}
        p="base"
      >
        <Input
          placeholder="Search chains"
          iconStart={Search}
          value={chainSearch}
          onChange={(e) => setChainSearch(e.target.value)}
          customSize={isMobile ? "medium" : "large"}
          autoComplete="off"
        />
        <Input
          placeholder="Search assets"
          iconStart={Search}
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
          customSize={isMobile ? "medium" : "large"}
          autoComplete="off"
        />
      </Grid>
      <Grid columnTemplate={["3.75rem 1fr", "11.25rem 1fr"]}>
        <ChainList
          items={filteredChains}
          selectedChain={pendingChain}
          setSelectedChain={setPendingChain}
        />
        <Flex direction="column">
          {filteredAssets.length ? (
            <AssetList
              items={filteredAssets}
              selectedAsset={currentSelection?.asset}
              setSelectedAsset={(asset) => {
                onAssetSelect({ chain: pendingChain, asset })
              }}
            />
          ) : (
            <Flex flex={1} align="center" justify="center" asChild>
              <Text align="center" fs="p5" color={getToken("text.medium")}>
                No assets found
              </Text>
            </Flex>
          )}
        </Flex>
      </Grid>
    </>
  )
}
