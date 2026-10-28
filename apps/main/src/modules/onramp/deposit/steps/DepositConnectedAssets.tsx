import {
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
} from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Input,
  ModalBody,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { useDepositDiscovery } from "@/modules/onramp/deposit/hooks/useDepositDiscovery"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import {
  ChainList,
  COMPACT_CHAIN_ITEM_HEIGHT,
} from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"

import {
  DepositSupportedAsset,
  getOtherDepositAssets,
} from "./DepositConnectedAssets.utils"

type DepositAssetEntry =
  | { kind: "holding"; key: string; row: DepositBalanceRow }
  | { kind: "other"; key: string; item: DepositSupportedAsset }
  | { kind: "hint"; key: string }
  | { kind: "loading"; key: string }

export const DepositConnectedAssets = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const data = useDepositDiscovery()
  const { sourceChainAssetPairs } = useXcmProvider()
  const { getValues, setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const activeAccount = useWeb3Connect((state) => state.account)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const setWalletFirstAsset = useOnrampModal(
    (state) => state.setWalletFirstAsset,
  )
  const [chainKey, setChainKey] = useState<string | null>(null)
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [showMoreChains, setShowMoreChains] = useState(false)
  const fundedChainKeys = new Set(data.rows.map((row) => row.source.chain.key))
  const fundedPairs = sourceChainAssetPairs.filter(({ chain }) =>
    fundedChainKeys.has(chain.key),
  )
  const showChainSelector = sourceChainAssetPairs.length > 1
  const chainPairs = showMoreChains ? sourceChainAssetPairs : fundedPairs
  const visiblePairs = chainPairs.filter(({ chain }) =>
    chain.name.toLowerCase().includes(chainSearch.trim().toLowerCase()),
  )
  const selectedPair = chainPairs.find(({ chain }) => chain.key === chainKey)
  const selectedChain = selectedPair?.chain ?? null
  const browsingUnowned =
    !!selectedChain && !fundedChainKeys.has(selectedChain.key)
  const rows = data.rows.filter(
    (row) =>
      (!selectedChain || row.source.chain.key === selectedChain.key) &&
      `${row.balance.originSymbol} ${row.balance.key} ${row.source.chain.name} ${row.source.account.name}`
        .toLowerCase()
        .includes(assetSearch.trim().toLowerCase()),
  )
  const otherAssets = showMoreChains
    ? getOtherDepositAssets(sourceChainAssetPairs, data.rows).filter(
        ({ asset, chain }) =>
          (!selectedChain || chain.key === selectedChain.key) &&
          `${asset.originSymbol} ${asset.key} ${chain.name}`
            .toLowerCase()
            .includes(assetSearch.trim().toLowerCase()),
      )
    : []
  const entries: DepositAssetEntry[] = [
    ...rows.map((row) => ({ kind: "holding" as const, key: row.key, row })),
    ...(data.scanning && !browsingUnowned
      ? Array.from({ length: rows.length ? 2 : 3 }, (_, index) => ({
          kind: "loading" as const,
          key: `loading:${index}`,
        }))
      : []),
    ...(otherAssets.length
      ? [
          { kind: "hint" as const, key: "other-assets-hint" },
          ...otherAssets.map((item) => ({
            kind: "other" as const,
            key: `other:${item.key}`,
            item,
          })),
        ]
      : []),
  ]

  const selectAsset = (chain: AnyChain, asset: Asset) => {
    setWalletFirstAsset({ chainKey: chain.key, assetKey: asset.key })
    resetAmounts()
    setValue("srcChain", chain)
    setValue("srcAsset", asset)
  }
  const selectHolding = (row: DepositBalanceRow) => {
    setAccount(row.source.account)
    selectAsset(
      row.source.chain,
      row.source.assets.find((asset) => asset.key === row.balance.key) ??
        row.balance,
    )
    paginateTo(OnrampScreen.DepositOnchainForm)
  }

  return (
    <>
      <SDepositStepHeader
        title={t("deposit.flow.assets.title")}
        align="center"
        closable
        onBack={() => paginateTo(OnrampScreen.DepositOnchainWallet)}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step="deposit-connected-assets"
          columnTemplate={
            !showChainSelector
              ? "minmax(0, 1fr)"
              : isMobile
                ? `${pxToRem(52)} minmax(0, 1fr)`
                : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          p={isMobile ? "base" : "m"}
          height={isMobile ? "100%" : pxToRem(450)}
          flex={1}
          sx={{ minHeight: 0 }}
        >
          {showChainSelector && (
            <Stack
              gap="base"
              justify="flex-start"
              minWidth={0}
              sx={{ minHeight: 0 }}
            >
              {!isMobile && (
                <Input
                  iconStart={Search}
                  placeholder={t("deposit.onchain.search.chains")}
                  aria-label={t("deposit.onchain.search.chains")}
                  value={chainSearch}
                  onChange={(event) => setChainSearch(event.target.value)}
                  sx={{ flexShrink: 0 }}
                />
              )}
              <Button
                variant={selectedChain ? "transparent" : "accent"}
                outline={!selectedChain}
                aria-label={t("deposit.onchain.allChains")}
                borderRadius={isMobile ? "m" : undefined}
                height={isMobile ? pxToRem(44) : undefined}
                sx={{ flexShrink: 0 }}
                onClick={() => setChainKey(null)}
              >
                {isMobile ? (
                  <Icon component={Layers} size="m" />
                ) : (
                  t("deposit.onchain.allChains")
                )}
              </Button>
              {visiblePairs.length > 0 && (
                <Box
                  height={pxToRem(
                    visiblePairs.length *
                      (isMobile ? 48 : COMPACT_CHAIN_ITEM_HEIGHT),
                  )}
                  flex="0 1 auto"
                  sx={{ minHeight: 0 }}
                >
                  <ChainList
                    compact
                    items={visiblePairs}
                    selectedChain={selectedChain}
                    setSelectedChain={(chain) =>
                      setChainKey(chain?.key ?? null)
                    }
                    fillHeight
                  />
                </Box>
              )}
              {sourceChainAssetPairs.length > fundedPairs.length && (
                <Button
                  variant="muted"
                  size="small"
                  sx={{ flexShrink: 0 }}
                  aria-label={t(
                    showMoreChains
                      ? "deposit.connected.fewerChains"
                      : "deposit.connected.moreChains",
                  )}
                  aria-expanded={showMoreChains}
                  onClick={() => {
                    setShowMoreChains((value) => !value)
                    setChainSearch("")
                    if (showMoreChains && browsingUnowned) setChainKey(null)
                  }}
                >
                  <Icon
                    component={showMoreChains ? ChevronUp : ChevronDown}
                    size="s"
                  />
                  {!isMobile &&
                    t(
                      showMoreChains
                        ? "deposit.connected.fewerChains"
                        : "deposit.connected.moreChains",
                    )}
                </Button>
              )}
            </Stack>
          )}
          <Stack
            gap="m"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
            <Input
              iconStart={Search}
              placeholder={t("common:search.placeholder.assets")}
              aria-label={t("common:search.placeholder.assets")}
              value={assetSearch}
              onChange={(event) => setAssetSearch(event.target.value)}
            />
            <Flex justify="space-between" px="l">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:asset")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:balance")}
              </Text>
            </Flex>
            {data.failed > 0 && (
              <Alert
                variant="warning"
                description={t("deposit.flow.assets.partial")}
              />
            )}
            <Box flex={1} sx={{ minHeight: 0 }}>
              {entries.length ? (
                <VirtualizedList
                  items={entries}
                  itemSize={50}
                  height="100%"
                  hideScrollbar
                  aria-busy={data.scanning && !browsingUnowned}
                  getItemKey={(index) => entries[index]!.key}
                  renderItem={(entry) => {
                    if (entry.kind === "loading")
                      return <DepositAssetListSkeleton count={1} />
                    if (entry.kind === "hint")
                      return (
                        <Flex align="center" height="100%" px="l">
                          <Text fs="p5" color={getToken("text.medium")}>
                            {t("deposit.connected.moreChainsHint")}
                          </Text>
                        </Flex>
                      )
                    if (entry.kind === "other") {
                      const { asset, chain } = entry.item
                      return (
                        <Box height="100%" sx={{ opacity: 0.5 }}>
                          <AssetListItem
                            asset={asset}
                            route={null}
                            symbol={asset.originSymbol}
                            name={chain.name}
                            chain={chain}
                            isLoading={false}
                            isSelected={false}
                            onClick={() => {
                              selectAsset(chain, asset)
                              paginateTo(OnrampScreen.DepositOnchainWallet)
                            }}
                          />
                        </Box>
                      )
                    }
                    const { row } = entry
                    return (
                      <AssetListItem
                        asset={row.balance}
                        route={null}
                        symbol={row.balance.originSymbol}
                        name={`${row.source.chain.name} · ${row.source.account.name}`}
                        chain={row.source.chain}
                        balance={row.balance}
                        balanceDisplay={row.value}
                        isLoading={false}
                        isSelected={
                          activeAccount?.provider ===
                            row.source.account.provider &&
                          activeAccount.address ===
                            row.source.account.address &&
                          getValues("srcChain")?.key === row.source.chain.key &&
                          getValues("srcAsset")?.key === row.balance.key
                        }
                        onClick={() => selectHolding(row)}
                      />
                    )
                  }}
                />
              ) : (
                <Stack gap="m" align="center" py="xl" px="m">
                  <Text fs="p4" color={getToken("text.medium")} align="center">
                    {t(
                      assetSearch.trim()
                        ? "deposit.connected.noMatches"
                        : "deposit.flow.assets.empty",
                    )}
                  </Text>
                  {!assetSearch.trim() && (
                    <Button
                      variant="secondary"
                      outline
                      size="small"
                      onClick={() =>
                        paginateTo(OnrampScreen.DepositOnchainWallet)
                      }
                    >
                      {t("deposit.connected.changeWallet")}
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>
      </ModalBody>
    </>
  )
}
