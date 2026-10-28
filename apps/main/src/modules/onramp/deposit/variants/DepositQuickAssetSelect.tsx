import { ChevronRight, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Input,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useHydrationDisplayAssetId } from "@/api/xcm"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
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
  const { t } = useTranslation(["common", "onramp"])
  const [search, setSearch] = useState("")
  const [assetKey, setAssetKey] = useState<string | null>(null)
  const getDisplayAssetId = useHydrationDisplayAssetId()
  const { getAsset } = useAssets()
  const assets = useMemo(() => {
    const groups = new Map<
      string,
      { asset: Asset; chain: AnyChain; pairs: AssetNetworkPair[] }
    >()
    for (const item of items) {
      const existing = groups.get(item.asset.key)
      if (existing) {
        if (!existing.pairs.some(({ chain }) => chain.key === item.chain.key))
          existing.pairs.push(item)
      } else groups.set(item.asset.key, { ...item, pairs: [item] })
    }
    return [...groups.values()]
      .map((item) => {
        const id = getDisplayAssetId(item.asset)
        return {
          ...item,
          name: (id && getAsset(id)?.name) || item.asset.originSymbol,
        }
      })
      .sort((a, b) => a.asset.originSymbol.localeCompare(b.asset.originSymbol))
  }, [items, getDisplayAssetId, getAsset])
  const query = search.trim().toLowerCase()
  const selected = assets.find(({ asset }) => asset.key === assetKey)
  const visibleAssets = assets.filter(({ asset, name }) =>
    `${asset.originSymbol} ${name}`.toLowerCase().includes(query),
  )
  const visibleNetworks =
    selected?.pairs.filter(({ chain }) =>
      `${chain.name} ${chain.key}`.toLowerCase().includes(query),
    ) ?? []
  const back = () => {
    if (selected) {
      setAssetKey(null)
      setSearch("")
    } else onBack()
  }

  return (
    <>
      <SOnrampStepHeader
        title={t(
          selected
            ? "onramp:deposit.guided.networkTitle"
            : "onramp:deposit.guided.assetTitle",
        )}
        description={
          selected
            ? t("onramp:deposit.guided.networkHeading", {
                symbol: selected.asset.originSymbol,
              })
            : undefined
        }
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody contained>
        <Stack
          gap="m"
          justify="flex-start"
          data-onramp-step={
            selected ? "deposit-quick-network" : "deposit-quick-assets"
          }
        >
          <Input
            autoFocus
            iconStart={Search}
            aria-label={t(
              selected
                ? "onramp:deposit.guided.searchNetworks"
                : "search.placeholder.assets",
            )}
            placeholder={t(
              selected
                ? "onramp:deposit.guided.searchNetworks"
                : "search.placeholder.assets",
            )}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Stack gap="s" justify="flex-start">
            {selected ? (
              visibleNetworks.map(({ asset, chain }) => (
                <Button
                  key={chain.key}
                  variant="ghost"
                  width="100%"
                  aria-pressed={
                    selectedAsset?.key === asset.key &&
                    selectedChain?.key === chain.key
                  }
                  onClick={() => onSelect({ asset, chain })}
                  sx={{
                    height: "auto",
                    px: "m",
                    py: "m",
                    borderRadius: "m",
                    gridTemplateColumns: "minmax(0, 1fr)",
                  }}
                >
                  <Flex gap="m" align="center" width="100%">
                    <ChainLogo
                      ecosystem={chain.ecosystem}
                      chainId={getChainId(chain)}
                      alt={chain.name}
                    />
                    <Text
                      flex={1}
                      fs="p3"
                      fw={500}
                      align="left"
                      color={getToken("text.high")}
                    >
                      {chain.name}
                    </Text>
                    <Icon component={ChevronRight} size="m" />
                  </Flex>
                </Button>
              ))
            ) : (
              <VirtualizedList
                items={visibleAssets}
                itemSize={50}
                maxVisibleItems={10}
                getItemKey={(index) => visibleAssets[index]!.asset.key}
                renderItem={({ asset, chain, name, pairs }) => (
                  <AssetListItem
                    asset={asset}
                    chain={chain}
                    symbol={asset.originSymbol}
                    name={name}
                    route={null}
                    showChainLogo={false}
                    isLoading={false}
                    isSelected={selectedAsset?.key === asset.key}
                    trailingElement={
                      pairs.length > 1 ? (
                        <Flex direction="column" align="flex-end" gap="base">
                          <Text fs="p6" color={getToken("text.medium")}>
                            {t("onramp:deposit.guided.networkCount", {
                              count: pairs.length,
                            })}
                          </Text>
                          <Flex gap="xs" align="center">
                            {pairs.map(({ chain }) => (
                              <ChainLogo
                                key={chain.key}
                                ecosystem={chain.ecosystem}
                                chainId={getChainId(chain)}
                                size="extra-small"
                                alt={chain.name}
                              />
                            ))}
                          </Flex>
                        </Flex>
                      ) : null
                    }
                    onClick={() => {
                      if (pairs.length === 1) onSelect(pairs[0]!)
                      else {
                        setAssetKey(asset.key)
                        setSearch("")
                      }
                    }}
                  />
                )}
              />
            )}
            {!(selected ? visibleNetworks : visibleAssets).length &&
              (selected ? (
                <Text
                  fs="p4"
                  color={getToken("text.medium")}
                  align="center"
                  py="l"
                >
                  {t("onramp:deposit.guided.emptySearch")}
                </Text>
              ) : (
                <AssetSelectEmptyState />
              ))}
          </Stack>
        </Stack>
      </DepositScrollBody>
    </>
  )
}
