import {
  Alert,
  Box,
  Flex,
  Icon,
  Image,
  ProgressBar,
  Select,
  Text,
  ValueStats,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId, shortenAccountAddress } from "@galacticcouncil/utils"
import {
  SRightColumn,
  SSearchInput,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import Big from "big.js"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { ChainLogo } from "@/components/ChainLogo"
import { EmptyState } from "@/components/EmptyState"
import { DepositConnectWalletEmptyState } from "@/modules/onramp/deposit/onchain/components/DepositConnectWalletEmptyState"
import { DepositHoldingSkeleton } from "@/modules/onramp/deposit/onchain/components/DepositHoldingSkeleton"
import {
  DepositBalanceRow,
  DepositGroupBy,
  DepositHoldingGroup,
  groupDepositHoldings,
} from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"
import { useDepositDiscovery } from "@/modules/onramp/deposit/onchain/hooks/useDepositDiscovery"
import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useAssets } from "@/providers/assetsProvider"
import { getMatchScore, MATCH_SCORE_MAX } from "@/utils/sort"

const SKELETON_ROW_COUNT = 15
const ROW_SIZE = 50
const HEADER_SIZE = 32
const GROUP_BY_OPTIONS = ["none", "asset", "account", "chain"] as const

type HoldingEntry =
  | {
      kind: "holding"
      key: string
      row: DepositBalanceRow
      name: string
      nested?: boolean
    }
  | { kind: "loading"; key: string }
  | { kind: "spacer"; key: string }
  | {
      kind: "header"
      key: string
      groupBy: "account" | "chain"
      group: DepositHoldingGroup
    }
  | {
      kind: "asset"
      key: string
      group: DepositHoldingGroup
      expanded: boolean
    }

const getSearchText = (
  { balance, source }: DepositBalanceRow,
  assetName: string,
) =>
  [
    balance.originSymbol,
    assetName,
    balance.key,
    source.chain.name,
    source.account.name,
    getWallet(source.account.provider)?.title,
  ]
    .join(" ")
    .toLowerCase()

export type DepositHoldingListProps = {
  provider: WalletProviderType | null
  onSelect: (row: DepositBalanceRow) => void
}

export const DepositHoldingList: React.FC<DepositHoldingListProps> = ({
  provider,
  onSelect,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { rows, total, accounts, progress, failed } = useDepositDiscovery({
    provider,
  })
  const { account: sourceWallet } = useAccount()
  const { watch } = useFormContext<XcmFormValues>()
  const [srcChain, srcAsset] = watch(["srcChain", "srcAsset"])
  const [search, setSearch] = useState("")
  const { getAsset } = useAssets()
  const { groupBy, setGroupBy } = useDepositStore()
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  if (accounts.length === 0)
    return (
      <Flex
        height="100%"
        align="center"
        justify="center"
        sx={{ overflowY: "auto" }}
      >
        <DepositConnectWalletEmptyState />
      </Flex>
    )

  const scanning = !progress.isSettled
  const query = search.trim().toLowerCase()
  const getAssetName = (row: DepositBalanceRow) =>
    (row.destAssetId && getAsset(row.destAssetId)?.name) || ""
  // Same scoring as the asset select modal: symbol match first, else name match.
  // Chain, account and wallet only filter; ties keep the value order.
  const getRank = (row: DepositBalanceRow) => {
    const symbolScore = getMatchScore(row.balance.originSymbol, query)
    return symbolScore
      ? MATCH_SCORE_MAX + symbolScore
      : getMatchScore(getAssetName(row), query)
  }
  const filtered = query
    ? rows
        .filter((row) => getSearchText(row, getAssetName(row)).includes(query))
        .sort((a, b) => getRank(b) - getRank(a))
    : rows
  const isSelectedRow = ({ source, balance }: DepositBalanceRow) =>
    sourceWallet?.provider === source.account.provider &&
    sourceWallet.address === source.account.address &&
    srcChain?.key === source.chain.key &&
    srcAsset?.key === balance.key

  const holding = (
    row: DepositBalanceRow,
    name = `${row.source.chain.name} · ${row.source.account.name}`,
    nested?: boolean,
  ): HoldingEntry => ({ kind: "holding", key: row.key, row, name, nested })

  const getEntries = (): HoldingEntry[] => {
    if (groupBy === "none") return filtered.map((row) => holding(row))
    const groups = groupDepositHoldings(filtered, groupBy)
    // Rows inside a group stay ranked, so the first is the group's best match
    if (query) groups.sort((a, b) => getRank(b.rows[0]!) - getRank(a.rows[0]!))
    return groups.flatMap((group, index): HoldingEntry[] => {
      if (groupBy !== "asset")
        return [
          // Space between sections, not sticky, so the pinned header stays flush
          ...(index > 0
            ? [{ kind: "spacer" as const, key: `spacer:${group.key}` }]
            : []),
          { kind: "header", key: `header:${group.key}`, groupBy, group },
          ...group.rows.map((row) =>
            holding(
              row,
              groupBy === "chain"
                ? row.source.account.name
                : row.source.chain.name,
            ),
          ),
        ]
      if (group.rows.length === 1) return [holding(group.rows[0]!)]
      const expanded = query
        ? true
        : (toggled[group.key] ?? group.rows.some(isSelectedRow))
      return [
        { kind: "asset", key: `asset:${group.key}`, group, expanded },
        ...(expanded
          ? group.rows.map((row) => holding(row, undefined, true))
          : []),
      ]
    })
  }

  // Nothing partial is shown until Discovery settles; then every row appears at once, sorted.
  const entries: HoldingEntry[] = scanning
    ? Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => ({
        kind: "loading" as const,
        key: `loading:${index}`,
      }))
    : getEntries()

  return (
    <SRightColumn height="100%">
      <SSearchInput
        customSize="large"
        placeholder={t("common:search.placeholder.assets")}
        aria-label={t("common:search.placeholder.assets")}
        value={search}
        disabled={scanning}
        onChange={(event) => setSearch(event.target.value)}
      />
      {scanning ? (
        <Flex direction="column" px="base" gap="xs" flexShrink={0} height="2xl">
          <Flex justify="space-between">
            <Text fs="p5" fw={500}>
              {t("deposit.flow.assets.scanning")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.tint.secondary")}>
              {t("deposit.flow.assets.scanningProgress", progress)}
            </Text>
          </Flex>
          <ProgressBar
            value={(progress.settled / progress.total) * 100}
            hideLabel
          />
        </Flex>
      ) : (
        <Flex px="base" height="2xl" align="center" gap="base">
          {Big(total).gt(0.1) && (
            <ValueStats
              label={t("deposit.flow.assets.total")}
              value={t("common:currency", { value: total })}
              wrap
              sx={{ flexShrink: 0 }}
            />
          )}
          <Select<DepositGroupBy>
            label={t("deposit.flow.assets.groupBy.label")}
            items={GROUP_BY_OPTIONS.map((key) => ({
              key,
              label: t(`deposit.flow.assets.groupBy.${key}`),
            }))}
            value={groupBy}
            onValueChange={(value) => {
              setGroupBy(value)
              setSearch("")
            }}
            sx={{ marginInlineStart: "auto" }}
          />
        </Flex>
      )}
      <Box flex={1} minHeight={0}>
        <Flex justify="space-between" pl="base" pr="m">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("common:asset")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("common:balance")}
          </Text>
        </Flex>
        {!scanning && failed > 0 && (
          <Alert
            variant="warning"
            description={t("deposit.flow.assets.partial")}
          />
        )}
        {entries.length > 0 ? (
          <VirtualizedList
            // Remount on regroup so the list starts from the top
            key={groupBy}
            items={entries}
            itemSize={(entry) =>
              entry.kind === "header" || entry.kind === "spacer"
                ? HEADER_SIZE
                : ROW_SIZE
            }
            isItemSticky={(entry) => entry.kind === "header"}
            height="100%"
            hideScrollbar
            aria-busy={scanning}
            getItemKey={(index) => entries[index]?.key ?? index}
            renderItem={(entry) => {
              if (entry.kind === "loading") return <DepositHoldingSkeleton />
              if (entry.kind === "spacer") return null
              if (entry.kind === "header")
                return (
                  <DepositHoldingGroupHeader
                    groupBy={entry.groupBy}
                    group={entry.group}
                  />
                )
              if (entry.kind === "asset") {
                const { group, expanded } = entry
                const { balance, destAssetId, source } = group.rows[0]!
                return (
                  <AssetListItem
                    asset={balance}
                    route={null}
                    symbol={balance.originSymbol}
                    name={t("deposit.flow.assets.sources", {
                      count: group.rows.length,
                    })}
                    chain={source.chain}
                    logo={
                      destAssetId ? <AssetLogo id={destAssetId} /> : undefined
                    }
                    balance={balance.copyWith({
                      amount: group.amount,
                      decimals: group.decimals,
                    })}
                    balanceDisplay={group.value}
                    isLoading={false}
                    isSelected={group.rows.some(isSelectedRow)}
                    aria-expanded={expanded}
                    trailing={
                      <Icon
                        component={ChevronDown}
                        size="s"
                        color={getToken("text.medium")}
                        sx={{
                          flexShrink: 0,
                          transform: expanded ? "rotate(180deg)" : undefined,
                          transition: "transform 0.15s",
                        }}
                      />
                    }
                    onClick={() =>
                      setToggled((state) => ({
                        ...state,
                        [group.key]: !expanded,
                      }))
                    }
                  />
                )
              }
              const { row } = entry
              const { source, balance } = row
              const item = (
                <AssetListItem
                  asset={balance}
                  route={null}
                  symbol={balance.originSymbol}
                  name={entry.name}
                  chain={source.chain}
                  balance={balance}
                  balanceDisplay={row.value}
                  isLoading={false}
                  isSelected={isSelectedRow(row)}
                  onClick={() => onSelect(row)}
                />
              )
              return entry.nested ? (
                <Box height="100%" pl="xl">
                  {item}
                </Box>
              ) : (
                item
              )
            }}
          />
        ) : query ? (
          <Text fs="p4" color={getToken("text.medium")} align="center" py="xl">
            {t("deposit.connected.noMatches")}
          </Text>
        ) : (
          <EmptyState
            header={t("deposit.flow.assets.empty")}
            description={t("deposit.flow.assets.emptyDescription")}
          />
        )}
      </Box>
    </SRightColumn>
  )
}

const DepositHoldingGroupHeader: React.FC<{
  groupBy: "account" | "chain"
  group: DepositHoldingGroup
}> = ({ groupBy, group }) => {
  const { t } = useTranslation(["common"])
  const { chain, account } = group.rows[0]!.source
  const wallet = getWallet(account.provider)
  const shortAddress = shortenAccountAddress(account.displayAddress)
  // EVM wallets like MetaMask name accounts by their address
  const showAddress = ![account.displayAddress, shortAddress].some(
    (address) => address.toLowerCase() === account.name.toLowerCase(),
  )
  return (
    // Opaque base so rows scrolling under the pinned header don't show through the tint
    <Box height="100%" bg={getToken("surfaces.themeBasePalette.surfaceHigh")}>
      <Flex
        align="center"
        gap="s"
        height="100%"
        px="m"
        bg={getToken("surfaces.containers.dim.dimOnBg")}
        borderRadius="m"
      >
        {groupBy === "chain" ? (
          <ChainLogo
            ecosystem={chain.ecosystem}
            chainId={getChainId(chain) ?? ""}
            size="small"
          />
        ) : (
          wallet && (
            <Image src={wallet.logo} alt={wallet.title} sx={{ size: "m" }} />
          )
        )}
        <Text fs="p5" fw={500} truncate>
          {groupBy === "chain" ? chain.name : account.name}
        </Text>
        {groupBy === "account" && showAddress && (
          <Text fs="p6" color={getToken("text.low")} sx={{ flexShrink: 0 }}>
            {shortAddress}
          </Text>
        )}
        {group.value && (
          <Text
            fs="p5"
            color={getToken("text.high")}
            sx={{ flexShrink: 0, marginInlineStart: "auto" }}
          >
            {t("currency", { value: group.value })}
          </Text>
        )}
      </Flex>
    </Box>
  )
}
