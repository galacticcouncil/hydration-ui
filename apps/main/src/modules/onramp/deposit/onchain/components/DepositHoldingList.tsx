import {
  Alert,
  Box,
  Flex,
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
  const { rows, total, accounts, scanning, failed } = useDepositDiscovery({
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

  const query = search.trim().toLowerCase()
  const filtered = query
    ? rows.filter((row) => getSearchText(row).includes(query))
    : rows
  const entries: HoldingEntry[] = [
    ...filtered.map((row) => ({ kind: "holding" as const, key: row.key, row })),
    ...(scanning
      ? Array.from({ length: filtered.length ? 2 : 3 }, (_, index) => ({
          kind: "loading" as const,
          key: `loading:${index}`,
        }))
      : []),
  ]

  return (
    <SRightColumn height="100%">
      <SSearchInput
        customSize="large"
        placeholder={t("common:search.placeholder.assets")}
        aria-label={t("common:search.placeholder.assets")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {Number(total) >= 0.1 && (
        <ValueStats
          label={t("deposit.flow.assets.total")}
          value={t("common:currency", { value: total })}
          wrap
          sx={{ flexShrink: 0 }}
        />
      )}
      <Flex justify="space-between" px="l">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("common:asset")}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {t("common:balance")}
        </Text>
      </Flex>
      {failed > 0 && (
        <Alert
          variant="warning"
          description={t("deposit.flow.assets.partial")}
        />
      )}
      <Box flex={1} pr="base" sx={{ minHeight: 0 }}>
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
                  isSelected={
                    sourceWallet?.provider === source.account.provider &&
                    sourceWallet.address === source.account.address &&
                    srcChain?.key === source.chain.key &&
                    srcAsset?.key === balance.key
                  }
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
