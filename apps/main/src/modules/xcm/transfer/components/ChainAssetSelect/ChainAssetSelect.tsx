import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { arraySearch } from "@galacticcouncil/utils"
import { useAccount, useWeb3ConnectModal } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { map, pipe, zip } from "remeda"

import { useHydrationDisplayAssetId } from "@/api/xcm"
import { AssetList } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetList"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import {
  getWalletModeByChain,
  isAccountValidOnChain,
} from "@/modules/xcm/transfer/utils/chain"
import { useAssets } from "@/providers/assetsProvider"

export type ChainAssetPair = {
  chain: AnyChain
  assets: Asset[]
  routes: AssetRoute[]
  isTagSelect: boolean
}

export type ChainAssetSelection = {
  chain: AnyChain
  asset: Asset
}

export type ChainAssetSelectModalSelectionChange = {
  previousSelection: ChainAssetSelection | null
  newSelection: ChainAssetSelection
}

export type ChainAssetSelectModalProps = {
  type: "source" | "destination"
  address?: string
  disabled?: boolean
  chainAssetPairs: ChainAssetPair[]
  currentSelection: ChainAssetSelection | null
  selectedChain: AnyChain | null
  onAssetSelect: (selection: ChainAssetSelection) => void
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
        <ChainAssetSelectContent {...props} />
      </ModalContent>
    </ModalRoot>
  )
}

export const ChainAssetSelectContent: React.FC<ChainAssetSelectModalProps> = ({
  type,
  address = "",
  chainAssetPairs,
  currentSelection,
  selectedChain,
  onAssetSelect,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const { getAsset } = useAssets()
  const getDisplayAssetId = useHydrationDisplayAssetId()
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [pendingChain, setPendingChain] = useState<AnyChain | null>(
    selectedChain ?? currentSelection?.chain ?? null,
  )

  const [mobileStep, setMobileStep] = useState<"chains" | "assets">(() =>
    currentSelection || chainAssetPairs.length === 1 ? "assets" : "chains",
  )
  const hasMultipleChains = chainAssetPairs.length > 1
  const showChainScreen =
    isMobile && hasMultipleChains && mobileStep === "chains"
  const activeChain =
    isMobile && chainAssetPairs.length === 1
      ? chainAssetPairs[0]!.chain
      : pendingChain

  const filteredChains = chainAssetPairs.filter(
    ({ chain }) =>
      chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
      chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  const filteredAssetsWithRoutes = useMemo(() => {
    if (!activeChain) return []
    const selectedChainPair = chainAssetPairs.find(
      ({ chain }) => chain.key === activeChain.key,
    )

    const assets = selectedChainPair?.assets ?? []
    const routes = selectedChainPair?.routes ?? []

    const assetsWithRoutes = routes.length
      ? selectedChainPair?.isTagSelect
        ? pipe(
            zip(routes, assets),
            map(([route, asset]) => ({ route, asset })),
          )
        : assets.map((asset) => ({
            asset,
            route:
              routes.find((r) => r.destination.asset.key === asset.key) ?? null,
          }))
      : assets.map((asset) => ({ asset, route: null }))

    return arraySearch(
      assetsWithRoutes.map((item) => {
        const registryId = getDisplayAssetId(item.asset)
        const symbol = item.asset.originSymbol
        const name = (registryId && getAsset(registryId)?.name) || symbol
        return { ...item, symbol, name }
      }),
      assetSearch,
      ["symbol", "name"],
    )
  }, [assetSearch, chainAssetPairs, getAsset, getDisplayAssetId, activeChain])

  const isCompatibleWalletMode =
    type === "source"
      ? !!activeChain && isAccountValidOnChain(account, activeChain)
      : true

  const assetPanel = (
    <Flex
      direction="column"
      minWidth={0}
      sx={isMobile ? { flex: 1, minHeight: 0 } : undefined}
    >
      {activeChain && isCompatibleWalletMode && (
        <AssetList
          fillHeight={isMobile}
          items={filteredAssetsWithRoutes}
          address={address}
          selectedAsset={currentSelection?.asset}
          selectedChain={activeChain}
          setSelectedAsset={(asset) => {
            onAssetSelect({ chain: activeChain, asset })
          }}
        />
      )}

      {activeChain && !isCompatibleWalletMode && (
        <ConnectChainTile
          layout="vertical"
          chain={activeChain}
          bg="transparent"
          onConnect={() =>
            toggle(getWalletModeByChain(activeChain), {
              title: t("connectWallet.modal.title", {
                chain: activeChain.name,
              }),
              description: t("connectWallet.modal.description", {
                chain: activeChain.name,
              }),
            })
          }
        />
      )}

      {!filteredAssetsWithRoutes.length && (
        <Flex flex={1} align="center" justify="center" asChild>
          <Text align="center" fs="p5" color={getToken("text.medium")}>
            {t("xcm:chainAssetSelect.emptyState.noAssets")}
          </Text>
        </Flex>
      )}
    </Flex>
  )

  return (
    <>
      <ModalHeader
        align="center"
        title={t(
          isMobile
            ? showChainScreen
              ? "selectChain"
              : "selectAsset"
            : "xcm:chainAssetSelect.modal.title",
        )}
        onBack={
          isMobile && hasMultipleChains && !showChainScreen
            ? () => setMobileStep("chains")
            : undefined
        }
        sx={{ flexShrink: 0 }}
      />
      <ModalBody
        scrollable={false}
        noPadding
        height={isMobile ? 0 : undefined}
        sx={{ minHeight: 0 }}
      >
        {isMobile ? (
          <Stack
            data-onramp-step={`xcm-chain-asset-${showChainScreen ? "chains" : "assets"}`}
            gap="base"
            p="base"
            height="100%"
            sx={{ minHeight: 0 }}
            justify="flex-start"
          >
            {showChainScreen ? (
              <>
                <Input
                  placeholder={t("search.placeholder.chains")}
                  aria-label={t("search.placeholder.chains")}
                  iconStart={Search}
                  value={chainSearch}
                  onChange={(e) => setChainSearch(e.target.value)}
                  customSize="medium"
                  autoComplete="off"
                />
                <Box flex={1} sx={{ minHeight: 0 }}>
                  <ChainList
                    fillHeight
                    variant="list"
                    items={filteredChains}
                    selectedChain={activeChain}
                    setSelectedChain={(chain) => {
                      setPendingChain(chain)
                      setMobileStep("assets")
                    }}
                  />
                </Box>
              </>
            ) : (
              <Grid
                columnTemplate={
                  hasMultipleChains
                    ? `${pxToRem(52)} minmax(0, 1fr)`
                    : "minmax(0, 1fr)"
                }
                gap="base"
                height="100%"
                sx={{ minHeight: 0 }}
              >
                {hasMultipleChains && (
                  <Box sx={{ minHeight: 0 }}>
                    <ChainList
                      fillHeight
                      items={chainAssetPairs}
                      selectedChain={activeChain}
                      setSelectedChain={setPendingChain}
                    />
                  </Box>
                )}
                <Stack
                  gap="base"
                  minWidth={0}
                  sx={{ minHeight: 0 }}
                  justify="flex-start"
                >
                  <Input
                    placeholder={t("search.placeholder.assets")}
                    aria-label={t("search.placeholder.assets")}
                    iconStart={Search}
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    customSize="medium"
                    autoComplete="off"
                  />
                  {assetPanel}
                </Stack>
              </Grid>
            )}
          </Stack>
        ) : (
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
                customSize="large"
                autoComplete="off"
              />
              <Input
                placeholder={t("search.placeholder.assets")}
                iconStart={Search}
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                customSize="large"
                autoComplete="off"
              />
            </Grid>
            <Grid columnTemplate={["3.75rem 1fr", "11.25rem 1fr"]}>
              <ChainList
                items={filteredChains}
                selectedChain={activeChain}
                setSelectedChain={setPendingChain}
              />
              {assetPanel}
            </Grid>
          </>
        )}
      </ModalBody>
    </>
  )
}
