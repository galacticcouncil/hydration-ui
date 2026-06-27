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
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/AssetList"
import { ChainAssetSelectButton } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/ChainAssetSelectButton"
import { ChainList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/ChainList"
import { HydrationAssetList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/HydrationAssetList"
import {
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { numericallyStrDesc } from "@/utils/sort"

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
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [pendingChain, setPendingChain] = useState<XcChain>(
    currentSelection?.chain ?? chainAssetPairs[0]!.chain,
  )

  const filteredChains = [
    ...chainAssetPairs
      .filter(
        ({ chain }) =>
          chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
          chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
      )
      .reduce<Map<string, XcChain>>((acc, { chain }) => {
        if (!acc.has(chain.key)) acc.set(chain.key, chain)
        return acc
      }, new Map())
      .values(),
  ].sort((a, b) => {
    if (a.key === HYDRATION_CHAIN_KEY) return -1
    if (b.key === HYDRATION_CHAIN_KEY) return 1
    return a.name.localeCompare(b.name)
  })

  const filteredAssets = chainAssetPairs
    .filter(({ chain }) => chain.key === pendingChain.key)
    .map(({ asset }) => asset)
    .filter((asset) =>
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()),
    )
    .sort((a, b) =>
      numericallyStrDesc(a.balanceUsd ?? "0", b.balanceUsd ?? "0"),
    )

  const isHydrationPending = pendingChain.key === HYDRATION_CHAIN_KEY
  const selectedAsset =
    currentSelection?.chain.key === pendingChain.key
      ? currentSelection.asset
      : undefined

  return (
    <>
      <Grid
        columnTemplate={["9rem 1fr", "10.25rem 1fr"]}
        gap={["base", "l"]}
        p="base"
      >
        <Input
          placeholder={t("search.placeholder.chains")}
          iconStart={Search}
          value={chainSearch}
          onChange={(e) => setChainSearch(e.target.value)}
          customSize={isMobile ? "medium" : "large"}
          autoComplete="off"
        />
        <Input
          placeholder={t("search.placeholder.assets")}
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
          {isHydrationPending ? (
            <HydrationAssetList
              chain={pendingChain}
              search={assetSearch}
              selectedAsset={selectedAsset}
              onAssetSelect={onAssetSelect}
            />
          ) : filteredAssets.length ? (
            <AssetList
              items={filteredAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={(asset) => {
                onAssetSelect({ chain: pendingChain, asset })
              }}
            />
          ) : (
            <Flex flex={1} align="center" justify="center">
              <AssetSelectEmptyState />
            </Flex>
          )}
        </Flex>
      </Grid>
    </>
  )
}
