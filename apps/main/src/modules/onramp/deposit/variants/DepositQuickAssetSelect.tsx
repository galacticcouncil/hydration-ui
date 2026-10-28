import { Layers, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Grid,
  Icon,
  Input,
  ModalBody,
  Stack,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useHydrationDisplayAssetId } from "@/api/xcm"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { useAssets } from "@/providers/assetsProvider"

type AssetNetworkPair = { asset: Asset; chain: AnyChain }
type DepositQuickAssetSelectProps = {
  items: AssetNetworkPair[]
  selectedAsset?: Asset
  selectedChain?: AnyChain
  onBack: () => void
  onSelect: (selection: AssetNetworkPair) => void
}

export const DepositQuickAssetSelect: FC<DepositQuickAssetSelectProps> = ({
  items,
  selectedAsset,
  selectedChain,
  onSelect,
  onBack,
}) => {
  const { t } = useTranslation(["common", "onramp", "xcm"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [chainKey, setChainKey] = useState(selectedChain?.key ?? null)
  const getDisplayAssetId = useHydrationDisplayAssetId()
  const { getAsset } = useAssets()
  const chains = useMemo(() => {
    const groups = new Map<string, { chain: AnyChain; assets: Asset[] }>()
    for (const { asset, chain } of items) {
      const group = groups.get(chain.key)
      if (group) group.assets.push(asset)
      else groups.set(chain.key, { chain, assets: [asset] })
    }
    return [...groups.values()]
  }, [items])
  const assets = useMemo(
    () =>
      items
        .map((item) => {
          const id = getDisplayAssetId(item.asset)
          return {
            ...item,
            key: `${item.chain.key}:${item.asset.key}`,
            name: (id && getAsset(id)?.name) || item.asset.originSymbol,
          }
        })
        .sort((a, b) =>
          a.asset.originSymbol.localeCompare(b.asset.originSymbol),
        ),
    [items, getDisplayAssetId, getAsset],
  )
  const chainQuery = chainSearch.trim().toLowerCase()
  const assetQuery = assetSearch.trim().toLowerCase()
  const visibleChains = chains.filter(({ chain }) =>
    `${chain.name} ${chain.key}`.toLowerCase().includes(chainQuery),
  )
  const activeChain =
    chains.find(({ chain }) => chain.key === chainKey)?.chain ?? null
  const visibleAssets = assets.filter(
    ({ asset, chain, name }) =>
      (!chainKey || chain.key === chainKey) &&
      `${asset.originSymbol} ${name} ${chain.name}`
        .toLowerCase()
        .includes(assetQuery),
  )

  return (
    <>
      <SOnrampStepHeader
        title={t("xcm:chainAssetSelect.modal.title")}
        align="center"
        closable
        onBack={onBack}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step="deposit-quick-assets"
          columnTemplate={`${pxToRem(isMobile ? 52 : 164)} minmax(0, 1fr)`}
          gap={isMobile ? "base" : "l"}
          p={isMobile ? "base" : "m"}
          height={isMobile ? "100%" : pxToRem(450)}
          flex={1}
          sx={{ minHeight: 0 }}
        >
          <Stack
            gap="base"
            minWidth={0}
            justify="flex-start"
            sx={{ minHeight: 0 }}
          >
            {!isMobile && (
              <Input
                iconStart={Search}
                placeholder={t("search.placeholder.chains")}
                aria-label={t("search.placeholder.chains")}
                value={chainSearch}
                onChange={(event) => setChainSearch(event.target.value)}
              />
            )}
            <Button
              variant={chainKey ? "transparent" : "accent"}
              outline={!chainKey}
              size="small"
              aria-label={t("onramp:deposit.onchain.allChains")}
              aria-pressed={!chainKey}
              width="100%"
              onClick={() => setChainKey(null)}
            >
              {isMobile ? (
                <Icon component={Layers} size="m" />
              ) : (
                t("onramp:deposit.onchain.allChains")
              )}
            </Button>
            <Box flex={1} sx={{ minHeight: 0 }}>
              <ChainList
                compact
                fillHeight
                items={visibleChains}
                selectedChain={activeChain}
                setSelectedChain={(chain) => setChainKey(chain?.key ?? null)}
              />
            </Box>
          </Stack>
          <Stack
            gap="base"
            minWidth={0}
            justify="flex-start"
            sx={{ minHeight: 0 }}
          >
            <Input
              autoFocus
              iconStart={Search}
              aria-label={t("search.placeholder.assets")}
              placeholder={t("search.placeholder.assets")}
              value={assetSearch}
              onChange={(event) => setAssetSearch(event.target.value)}
            />
            {visibleAssets.length ? (
              <VirtualizedList
                items={visibleAssets}
                itemSize={50}
                getItemKey={(index) => visibleAssets[index]!.key}
                sx={{ flex: 1, minHeight: 0 }}
                renderItem={({ asset, chain, name }) => (
                  <AssetListItem
                    asset={asset}
                    chain={chain}
                    symbol={asset.originSymbol}
                    name={chainKey ? name : chain.name}
                    route={null}
                    isLoading={false}
                    isSelected={
                      selectedAsset?.key === asset.key &&
                      selectedChain?.key === chain.key
                    }
                    trailingElement={null}
                    onClick={() => onSelect({ asset, chain })}
                  />
                )}
              />
            ) : (
              <AssetSelectEmptyState />
            )}
          </Stack>
        </Grid>
      </ModalBody>
    </>
  )
}
