import {
  Alert,
  Box,
  Flex,
  ProgressBar,
  Text,
  ValueStats,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  SRightColumn,
  SSearchInput,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import Big from "big.js"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { DepositConnectWalletEmptyState } from "@/modules/onramp/deposit/onchain/components/DepositConnectWalletEmptyState"
import { DepositHoldingSkeleton } from "@/modules/onramp/deposit/onchain/components/DepositHoldingSkeleton"
import { DepositBalanceRow } from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"
import { useDepositDiscovery } from "@/modules/onramp/deposit/onchain/hooks/useDepositDiscovery"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

const SKELETON_ROW_COUNT = 15

type HoldingEntry =
  | { kind: "holding"; key: string; row: DepositBalanceRow }
  | { kind: "loading"; key: string }

const getSearchText = ({ balance, source }: DepositBalanceRow) =>
  [
    balance.originSymbol,
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
  const filtered = query
    ? rows.filter((row) => getSearchText(row).includes(query))
    : rows
  // Nothing partial is shown until Discovery settles; then every row appears at once, sorted.
  const entries: HoldingEntry[] = scanning
    ? Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => ({
        kind: "loading" as const,
        key: `loading:${index}`,
      }))
    : filtered.map((row) => ({ kind: "holding" as const, key: row.key, row }))

  const isSelectedRow = ({ source, balance }: DepositBalanceRow) =>
    sourceWallet?.provider === source.account.provider &&
    sourceWallet.address === source.account.address &&
    srcChain?.key === source.chain.key &&
    srcAsset?.key === balance.key

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
        Big(total).gt(0.1) && (
          <Flex px="base" height="2xl">
            <ValueStats
              label={t("deposit.flow.assets.total")}
              value={t("common:currency", { value: total })}
              wrap
              sx={{ flexShrink: 0 }}
            />
          </Flex>
        )
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
            items={entries}
            itemSize={50}
            height="100%"
            hideScrollbar
            aria-busy={scanning}
            getItemKey={(index) => entries[index]?.key ?? index}
            renderItem={(entry) => {
              if (entry.kind === "loading") return <DepositHoldingSkeleton />
              const { row } = entry
              const { source, balance } = row
              return (
                <AssetListItem
                  asset={balance}
                  route={null}
                  symbol={balance.originSymbol}
                  name={`${source.chain.name} · ${source.account.name}`}
                  chain={source.chain}
                  balance={balance}
                  balanceDisplay={row.value}
                  isLoading={false}
                  isSelected={isSelectedRow(row)}
                  onClick={() => onSelect(row)}
                />
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
