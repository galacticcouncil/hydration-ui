import {
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  WalletIcon,
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
  ValueStats,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import {
  useAccount,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { WalletSourceButton } from "@galacticcouncil/web3-connect/src/components/content/WalletManagementSource"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { depositStepAfterAsset } from "@/modules/onramp/deposit/DepositWalletFirstFlow.utils"
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
import { useRpcProvider } from "@/providers/rpcProvider"

type DepositAssetEntry =
  | { kind: "holding"; key: string; row: DepositBalanceRow }
  | { kind: "loading"; key: string }

const getChainName = (chain: AnyChain) =>
  chain.name === "AssetHub Polkadot" ? "Assethub" : chain.name

export const DepositConnectedAssets = ({
  splitWallets = false,
}: {
  splitWallets?: boolean
}) => {
  const [connecting, setConnecting] = useState(false)
  const [walletSearch, setWalletSearch] = useState("")
  const { papi } = useRpcProvider()
  const { t } = useTranslation(["onramp", "common"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const sourceAccount = useOnrampModal((state) => state.depositSourceAccount)
  const data = useDepositDiscovery({
    account: splitWallets && !sourceAccount ? undefined : sourceAccount,
  })
  const { sourceChainAssetPairs: supportedPairs } = useXcmProvider()
  const sourceChainAssetPairs = supportedPairs.filter(({ chain }) =>
    data.rows.some((row) => row.source.chain.key === chain.key),
  )
  const { getValues, setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const setSourceAccount = useOnrampModal(
    (state) => state.setDepositSourceAccount,
  )
  const { account: activeAccount } = useAccount()
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const setWalletFirstAsset = useOnrampModal(
    (state) => state.setWalletFirstAsset,
  )
  const [chainKey, setChainKey] = useState<string | null>(null)
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [showMoreChains, setShowMoreChains] = useState(false)
  const fundedChainKeys = new Set(data.rows.map((row) => row.source.chain.key))
  const fundedPairs = sourceChainAssetPairs.slice(0, 5)
  const chainPairs =
    showMoreChains || chainSearch.trim()
      ? sourceChainAssetPairs
      : sourceChainAssetPairs.filter(
          ({ chain }) =>
            fundedPairs.some((pair) => pair.chain.key === chain.key) ||
            chain.key === chainKey,
        )
  const visiblePairs = chainPairs.filter(({ chain }) =>
    `${getChainName(chain)} ${chain.name} ${chain.key}`
      .toLowerCase()
      .includes(chainSearch.trim().toLowerCase()),
  )
  const selectedPair = sourceChainAssetPairs.find(
    ({ chain }) => chain.key === chainKey,
  )
  const selectedChain = selectedPair?.chain ?? null
  const browsingUnowned =
    !!selectedChain && !fundedChainKeys.has(selectedChain.key)
  const rows = data.rows.filter(
    (row) =>
      (!selectedChain || row.source.chain.key === selectedChain.key) &&
      `${row.balance.originSymbol} ${row.balance.key} ${getChainName(row.source.chain)} ${row.source.chain.name} ${row.source.account.name}`
        .toLowerCase()
        .includes(assetSearch.trim().toLowerCase()),
  )
  const entries: DepositAssetEntry[] = [
    ...rows.map((row) => ({ kind: "holding" as const, key: row.key, row })),
    ...(data.scanning && !browsingUnowned
      ? Array.from({ length: rows.length ? 2 : 3 }, (_, index) => ({
          kind: "loading" as const,
          key: `loading:${index}`,
        }))
      : []),
  ]

  const selectAsset = (chain: AnyChain, asset: Asset) => {
    setWalletFirstAsset({ chainKey: chain.key, assetKey: asset.key })
    resetAmounts()
    setValue("srcChain", chain)
    setValue("srcAsset", asset)
    setValue("destAddress", "")
    setValue("destAccount", null)
  }
  const selectHolding = (row: DepositBalanceRow) => {
    setSourceAccount(row.source.account)
    selectAsset(
      row.source.chain,
      row.source.assets.find((asset) => asset.key === row.balance.key) ??
        row.balance,
    )
    paginateTo(depositStepAfterAsset("connected"))
  }

  if (connecting)
    return (
      <Web3ConnectPage
        layout="split"
        walletFirst
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.Default}
        meta={{
          title: t("deposit.onchain.wallet.title"),
          hideExternalWallet: true,
          hideMultisig: true,
          closable: true,
        }}
        onBack={() => setConnecting(false)}
        onAccountSelect={(account) => {
          setSourceAccount(account)
          setChainKey(null)
          setConnecting(false)
        }}
      />
    )

  return (
    <>
      <SDepositStepHeader
        title={t("deposit.flow.assets.title")}
        align="center"
        closable
        onBack={() => {
          // Leaving asset selection starts a fresh wallet step, rather than
          // resuming the previous asset and sending Back to this screen again.
          setWalletFirstAsset(null)
          setValue("srcChain", null)
          setValue("srcAsset", null)
          setValue("bridgeProvider", null)
          void resetAmounts()
          if (splitWallets) {
            paginateTo(OnrampScreen.MethodSelect)
            useOnrampModal.getState().setModal("deposit")
          } else paginateTo(OnrampScreen.DepositOnchainWallet)
        }}
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
            splitWallets
              ? isMobile
                ? "7rem minmax(0, 1fr)"
                : "12rem minmax(0, 1fr)"
              : isMobile
                ? `${pxToRem(52)} minmax(0, 1fr)`
                : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          py={isMobile ? "base" : "m"}
          sx={{ minHeight: 0, px: "var(--modal-content-padding)" }}
          height={isMobile ? "100%" : pxToRem(450)}
          flex={1}
        >
          <Stack
            gap="base"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
            {splitWallets ? (
              <Stack gap="s" justify="flex-start" sx={{ overflowY: "auto" }}>
                <Input
                  iconStart={Search}
                  placeholder={t("deposit.split.searchWallets")}
                  aria-label={t("deposit.split.searchWallets")}
                  value={walletSearch}
                  onChange={(event) => setWalletSearch(event.target.value)}
                />
                <WalletSourceButton
                  title={t("deposit.split.allWallets")}
                  icon={Layers}
                  active={!sourceAccount}
                  onClick={() => {
                    useOnrampModal.setState({ depositSourceAccount: null })
                    setChainKey(null)
                  }}
                />
                {data.accounts
                  .filter((account) =>
                    `${getWallet(account.provider)?.title} ${account.name} ${account.displayAddress}`
                      .toLowerCase()
                      .includes(walletSearch.trim().toLowerCase()),
                  )
                  .map((account) => (
                    <WalletSourceButton
                      key={`${account.provider}:${account.address}`}
                      title={
                        getWallet(account.provider)?.title ?? account.provider
                      }
                      subtitle={`${account.name} · ${shortenAccountAddress(account.displayAddress)}`}
                      logo={getWallet(account.provider)?.logo}
                      connected
                      active={
                        sourceAccount?.provider === account.provider &&
                        sourceAccount.address === account.address
                      }
                      onClick={() => {
                        setSourceAccount(account)
                        setChainKey(null)
                      }}
                    />
                  ))}
                <WalletSourceButton
                  title={t("deposit.quick.connectSourceWallet")}
                  icon={WalletIcon}
                  onClick={() => setConnecting(true)}
                />
              </Stack>
            ) : (
              <>
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
                      getChainName={getChainName}
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
              </>
            )}
          </Stack>
          <Stack
            gap="m"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
            {!data.pricesLoading && Number(data.total) >= 0.1 && (
              <ValueStats
                label={t("deposit.v3.assets.total")}
                value={t("common:currency", { value: data.total })}
                wrap
                sx={{ flexShrink: 0 }}
              />
            )}
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
                    const { row } = entry
                    return (
                      <AssetListItem
                        asset={row.balance}
                        route={null}
                        symbol={row.balance.originSymbol}
                        name={`${getChainName(row.source.chain)} · ${row.source.account.name}`}
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
