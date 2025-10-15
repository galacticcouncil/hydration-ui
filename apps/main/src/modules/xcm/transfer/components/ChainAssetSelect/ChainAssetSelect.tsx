import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  AssetLabel,
  Box,
  Button,
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Skeleton,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { useTranslation } from "react-i18next"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssets } from "@/providers/assetsProvider"
import { SelectedAssetAndChain, useXcmStore } from "@/states/xcm"
import { scaleHuman } from "@/utils/formatting"

export type ChainAssetPair = {
  chain: AnyChain
  assets: Asset[]
}

const CHAIN_ITEM_HEIGHT = 40
const MAX_VISIBLE_CHAIN_ITEMS = 10
const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

export type ChainAssetSelectModalProps = {
  type: "source" | "destination"
  address?: string
  disabled?: boolean
  chainAssetPairs: ChainAssetPair[]
  selectedAsset?: SelectedAssetAndChain | null
  onSelectionChange?: (selection: SelectedAssetAndChain | null) => void
  selectedChain: AnyChain | null
  setSelectedChain: (chain: AnyChain | null) => void
}

export const ChainAssetSelectModal: React.FC<ChainAssetSelectModalProps> = ({
  type,
  address = "",
  disabled = false,
  chainAssetPairs,
  selectedAsset,
  onSelectionChange,
  selectedChain,
  setSelectedChain,
}) => {
  const { registryChain } = useXcmProvider()
  const { t } = useTranslation(["common", "xcm"])
  const { getAsset } = useAssets()
  const { chainSearch, setChainSearch, assetSearch, setAssetSearch } =
    useXcmStore()

  const currentSelection = selectedAsset || (type === "source" ? null : null)
  const setSelection = (selection: SelectedAssetAndChain | null) => {
    onSelectionChange?.(selection)
  }

  // Filter chains based on search
  const filteredChains = chainAssetPairs.filter(
    ({ chain }) =>
      chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
      chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  // Get assets for the selected chain
  const selectedChainPair = chainAssetPairs.find(
    ({ chain }) => chain.key === selectedChain?.key,
  )
  const availableAssets = selectedChainPair?.assets || []

  // Filter assets based on search
  const filteredAssets = availableAssets.filter((asset) =>
    asset.originSymbol.toLowerCase().includes(assetSearch.toLowerCase()),
  )

  const { isLoading: isBalancesLoading } = useCrossChainBalanceSubscription(
    address,
    selectedChain?.key ?? "",
  )

  const { data: balances } = useCrossChainBalance(
    address,
    selectedChain?.key ?? "",
  )

  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <ChainAssetSelectButton
          currentSelection={currentSelection}
          disabled={disabled}
          type={type}
        />
      </ModalTrigger>
      <ModalContent>
        <ModalHeader
          align="center"
          title={t("xcm:chainAssetSelect.modal.title")}
        />
        <ModalBody scrollable={false} noPadding>
          <Grid columnTemplate="180px 1fr">
            <Box>
              <Box p={10}>
                <Input
                  placeholder={t("xcm:chainAssetSelect.search.chains")}
                  iconStart={Search}
                  value={chainSearch}
                  onChange={(e) => setChainSearch(e.target.value)}
                  customSize="large"
                />
              </Box>
              <VirtualizedList
                items={filteredChains}
                itemSize={CHAIN_ITEM_HEIGHT}
                maxVisibleItems={MAX_VISIBLE_CHAIN_ITEMS}
                initialScrollIndex={filteredChains.findIndex(
                  ({ chain }) => chain.key === selectedChain?.key,
                )}
                sx={{
                  px: 10,
                  minHeight: CHAIN_ITEM_HEIGHT * MAX_VISIBLE_CHAIN_ITEMS,
                }}
                renderItem={({ chain }) => {
                  const isActive = chain.key === selectedChain?.key

                  return (
                    <Box pb={4}>
                      <Button
                        variant={isActive ? "muted" : "transparent"}
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          px: 10,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: isActive
                            ? getToken("buttons.secondary.accent.outline")
                            : "transparent",
                        }}
                        gap={4}
                        onClick={() => setSelectedChain(chain)}
                      >
                        <ChainLogo chain={chain} size="small" />
                        <Text color={getToken("text.medium")}>
                          {chain.name}
                        </Text>
                      </Button>
                    </Box>
                  )
                }}
              />
            </Box>
            <Flex direction="column">
              <Box p={10}>
                <Input
                  placeholder={t("xcm:chainAssetSelect.search.assets")}
                  iconStart={Search}
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  customSize="large"
                />
              </Box>
              <VirtualizedList
                items={filteredAssets.map((asset) => ({ asset }))}
                itemSize={ASSET_ITEM_HEIGHT}
                maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
                renderItem={(item: { asset: Asset }) => {
                  const { asset } = item
                  const registryId = registryChain.getBalanceAssetId(asset)
                  const registryAsset = getAsset(registryId.toString())
                  const balance = balances?.get(asset.key)
                  const isLoading = isBalancesLoading && !balances

                  return (
                    <ModalClose asChild>
                      <Flex
                        justify="space-between"
                        align="center"
                        px={10}
                        height="100%"
                        onClick={() => {
                          if (selectedChain) {
                            setSelection({ chain: selectedChain, asset })
                          }
                        }}
                        sx={{
                          borderBottom: "1px solid",
                          borderBottomColor: getToken("details.separators"),
                          cursor: "pointer",
                          "&:hover": {
                            background: getToken("details.separators"),
                          },
                        }}
                      >
                        <Flex align="center" gap={8}>
                          {selectedChain && (
                            <XAssetLogo asset={asset} chain={selectedChain} />
                          )}
                          <AssetLabel
                            symbol={registryAsset?.symbol || asset.originSymbol}
                            name={registryAsset?.name}
                          />
                        </Flex>
                        <Text fs="p4" fw={500}>
                          {isLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            t("currency", {
                              value: balance
                                ? scaleHuman(balance.amount, balance.decimals)
                                : "0",
                              symbol: asset?.originSymbol,
                            })
                          )}
                        </Text>
                      </Flex>
                    </ModalClose>
                  )
                }}
              />
              {!filteredAssets.length && (
                <Flex flex={1} align="center" justify="center">
                  <Text align="center" fs="p5" color={getToken("text.medium")}>
                    {t("xcm:chainAssetSelect.emptyState.noAssets")}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Grid>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  )
}
