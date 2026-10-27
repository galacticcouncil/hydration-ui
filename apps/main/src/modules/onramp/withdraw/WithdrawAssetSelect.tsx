import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Input,
  ModalBody,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import {
  toAccount,
  useAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { accountBalancesQuery, useAccountBalanceFilter } from "@/api/balances"
import { hydrationClientQuery } from "@/api/xcm"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import { selectWithdrawSourceAccount } from "@/modules/onramp/withdraw/WithdrawOnchain.utils"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"
import { SAssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem.styled"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { XCM_CHAINS } from "@/modules/xcm/transfer/utils/chain"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { sortAssets } from "@/utils/sort"

import { WithdrawAssetSelection } from "./WithdrawAssetSelect.utils"

type WithdrawAssetSelectProps = {
  onSelect: (selection: WithdrawAssetSelection) => void
  onBack: () => void
  initialDestinationChainKey?: string | null
}

export const WithdrawAssetSelect: FC<WithdrawAssetSelectProps> = ({
  onSelect,
  onBack,
  initialDestinationChainKey,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const [mobileStep, setMobileStep] = useState<"chains" | "assets">(
    initialDestinationChainKey ? "assets" : "chains",
  )
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  useEffect(() => {
    void queryClient.prefetchQuery(hydrationClientQuery())
  }, [queryClient])
  const { account } = useAccount()
  const storedAccounts = useWeb3Connect((state) => state.accounts)
  const providers = useWeb3Connect((state) => state.providers)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { getAsset } = useAssets()
  const [chainSearch, setChainSearch] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedChainKey, setSelectedChainKey] = useState<string | null>(
    initialDestinationChainKey ?? null,
  )

  const sourceAccount = useMemo(
    () =>
      selectWithdrawSourceAccount(
        account,
        storedAccounts
          .filter((candidate) =>
            providers.some(
              (provider) =>
                provider.type === candidate.provider &&
                provider.status === WalletProviderStatus.Connected,
            ),
          )
          .map(toAccount),
      ),
    [account, providers, storedAccounts],
  )
  const options = useWithdrawDestinationOptions()

  const pairs = useMemo<ChainAssetPair[]>(
    () =>
      XCM_CHAINS.flatMap((chain) => {
        const assets = new Map(
          options
            .filter((option) => option.destinationChainKey === chain.key)
            .map((option) => [
              option.destinationAssetKey,
              option.destinationAsset,
            ]),
        )
        return assets.size
          ? [
              {
                chain,
                assets: [...assets.values()],
                routes: [],
                isTagSelect: false,
              },
            ]
          : []
      }),
    [options],
  )
  const showChainSelector = pairs.length !== 1
  const mobileChains = isMobile && showChainSelector && mobileStep === "chains"
  const visiblePairs = pairs.filter(({ chain }) => {
    if (!showChainSelector) return true
    const matchesEcosystem =
      filter === "all" ||
      (filter === "polkadot"
        ? chain.ecosystem === ChainEcosystem.Polkadot ||
          chain.ecosystem === ChainEcosystem.Kusama
        : isAnyEvmChain(chain))
    return (
      matchesEcosystem &&
      chain.name.toLowerCase().includes(chainSearch.trim().toLowerCase())
    )
  })
  const selectedChain =
    visiblePairs.find(({ chain }) => chain.key === selectedChainKey)?.chain ??
    visiblePairs[0]?.chain ??
    null
  const balanceFilter = useAccountBalanceFilter()
  // Destination rows show funds held by the compatible connected Hydration source account.
  const {
    data: balances,
    isPending: isBalancesPending,
    isError: isBalancesError,
  } = useQuery(
    accountBalancesQuery(rpc, sourceAccount?.address ?? "", balanceFilter),
  )
  const priceIds = useMemo(() => Object.keys(balances ?? {}), [balances])
  const { getAssetPrice } = useAssetsPrice(priceIds)
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const withBalances = options.flatMap((option) => {
      if (option.destinationChainKey !== selectedChain?.key) return []
      const source = getAsset(option.assetId)
      if (!source) return []
      if (
        term &&
        !`${option.destinationAsset.originSymbol} ${source.name} ${source.symbol}`
          .toLowerCase()
          .includes(term)
      )
        return []
      const balance =
        sourceAccount && balances
          ? scaleHuman(balances[source.id]?.transferable ?? 0n, source.decimals)
          : undefined
      const { price, isValid } = getAssetPrice(source.id)
      const balanceDisplay =
        balance !== undefined && isValid
          ? Big(balance).times(price).toString()
          : undefined
      return [
        {
          ...source,
          ...option,
          symbol: option.destinationAsset.originSymbol,
          balance,
          balanceDisplay,
          sortBalance: balanceDisplay ?? "0",
        },
      ]
    })
    return sortAssets(withBalances, "sortBalance", { search })
  }, [
    balances,
    getAsset,
    getAssetPrice,
    options,
    search,
    selectedChain?.key,
    sourceAccount,
  ])

  return (
    <>
      <SOnrampStepHeader
        title={t(
          isMobile
            ? mobileChains
              ? "common:selectChain"
              : "common:selectAsset"
            : "withdraw.destination.title",
        )}
        align="center"
        closable
        onBack={() => {
          if (isMobile && showChainSelector && mobileStep === "assets")
            setMobileStep("chains")
          else onBack()
        }}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step={
            mobileChains ? "withdraw-chains" : "withdraw-assets"
          }
          columnTemplate={
            !showChainSelector || mobileChains
              ? "minmax(0, 1fr)"
              : isMobile
                ? `${pxToRem(52)} minmax(0, 1fr)`
                : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          p="m"
          flex={1}
          minWidth={0}
          height={isMobile ? "100%" : pxToRem(450)}
          sx={{ minHeight: 0 }}
        >
          {showChainSelector && (
            <Stack
              gap="base"
              justify="flex-start"
              minWidth={0}
              sx={{ minHeight: 0 }}
            >
              {(!isMobile || mobileChains) && (
                <Input
                  iconStart={Search}
                  placeholder={t("common:search.placeholder.chains")}
                  aria-label={t("common:search.placeholder.chains")}
                  value={chainSearch}
                  onChange={(event) => setChainSearch(event.target.value)}
                />
              )}
              <Text
                fs={isMobile && !mobileChains ? "p6" : "p5"}
                color={getToken("text.medium")}
              >
                {t("deposit.onchain.chains")}
              </Text>
              <Box flex={1} sx={{ minHeight: 0 }}>
                <ScrollArea height="100%" hideScrollbar>
                  <ChainList
                    variant={mobileChains ? "list" : "rail"}
                    items={visiblePairs}
                    selectedChain={selectedChain}
                    setSelectedChain={(chain) => {
                      setSelectedChainKey(chain?.key ?? null)
                      if (isMobile && chain) {
                        setChainSearch("")
                        setMobileStep("assets")
                      }
                    }}
                  />
                </ScrollArea>
              </Box>
            </Stack>
          )}
          {!mobileChains && (
            <Stack
              gap="m"
              justify="flex-start"
              minWidth={0}
              sx={{ minHeight: 0 }}
            >
              <Input
                iconStart={Search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("common:search.placeholder.assets")}
                aria-label={t("common:search.placeholder.assets")}
              />
              {!isMobile && showChainSelector && (
                <Flex gap="base" wrap>
                  {(["all", "polkadot", "evm"] as const).map((value) => (
                    <Button
                      key={value}
                      variant={filter === value ? "secondary" : "muted"}
                      size="small"
                      minWidth={pxToRem(72)}
                      onClick={() => setFilter(value)}
                    >
                      {t(`deposit.onchain.filter.${value}`)}
                    </Button>
                  ))}
                </Flex>
              )}
              {isBalancesError && (
                <Alert
                  variant="warning"
                  description={t("withdraw.entry.balancesUnavailable")}
                />
              )}
              <Flex justify="space-between" px="base">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("common:asset")}
                </Text>
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("common:balance")}
                </Text>
              </Flex>
              <Box flex={1} sx={{ minHeight: 0 }}>
                {rows.length ? (
                  <VirtualizedList
                    hideScrollbar
                    items={rows}
                    itemSize={60}
                    height="100%"
                    getItemKey={(index) => {
                      const row = rows[index]
                      return row
                        ? `${row.sourceAssetKey}:${row.destinationChainKey}:${row.destinationAssetKey}`
                        : index
                    }}
                    renderItem={(row) => (
                      <SAssetListItem
                        as="button"
                        isSelected={false}
                        onClick={() => {
                          if (sourceAccount) setAccount(sourceAccount)
                          onSelect({
                            assetId: row.assetId,
                            sourceAssetKey: row.sourceAssetKey,
                            destinationChainKey: row.destinationChainKey,
                            destinationAssetKey: row.destinationAssetKey,
                          })
                        }}
                      >
                        <Flex gap="base" align="center" minWidth={0}>
                          <XAssetLogo
                            asset={row.destinationAsset}
                            chain={row.destinationChain}
                          />
                          <Text fs="p3" fw={500}>
                            {row.destinationAsset.originSymbol}
                          </Text>
                        </Flex>
                        <Stack gap="xs" align="flex-end">
                          {sourceAccount && isBalancesPending ? (
                            <Skeleton width={48} height="1em" />
                          ) : (
                            <Text fs="p4" fw={500}>
                              {row.balance === undefined
                                ? "—"
                                : row.sourceAsset.originSymbol !==
                                    row.destinationAsset.originSymbol
                                  ? t("common:currency", {
                                      value: row.balance,
                                      symbol: row.sourceAsset.originSymbol,
                                    })
                                  : t("common:number", { value: row.balance })}
                            </Text>
                          )}
                          <Text fs="p6" color={getToken("text.medium")}>
                            {row.balanceDisplay === undefined
                              ? "—"
                              : t("common:currency", {
                                  value: row.balanceDisplay,
                                })}
                          </Text>
                        </Stack>
                      </SAssetListItem>
                    )}
                  />
                ) : (
                  <AssetSelectEmptyState />
                )}
              </Box>
            </Stack>
          )}
        </Grid>
      </ModalBody>
    </>
  )
}
