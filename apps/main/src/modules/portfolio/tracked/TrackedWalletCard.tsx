import {
  CollapsibleContent,
  CollapsibleRoot,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMultichainPortfolio } from "@/api/portfolio"
import { TRACKED_CHAINS } from "@/config/portfolio"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { PortfolioChainSection } from "@/modules/portfolio/overview/PortfolioChainSection"
import {
  SPortfolioChainsList,
  SPortfolioPaper,
} from "@/modules/portfolio/overview/PortfolioOverview.styled"
import { TrackedWalletHeader } from "@/modules/portfolio/tracked/TrackedWalletHeader"
import { TrackedWallet, useTrackedWalletActions } from "@/states/trackedWallets"

type Props = {
  readonly wallet: TrackedWallet
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
}

export const TrackedWalletCard: FC<Props> = ({
  wallet,
  searchPhrase,
  sortingProps,
}) => {
  const { t } = useTranslation("wallet")
  const { remove } = useTrackedWalletActions()
  const { byChain, refetchAll, isRefetching, lastUpdatedAt, isLoading } =
    useMultichainPortfolio([wallet.address], TRACKED_CHAINS)
  const [open, setOpen] = useState(true)
  const showNoBalances = !isLoading && byChain.length === 0

  return (
    <SPortfolioPaper data-address={wallet.address}>
      <CollapsibleRoot open={open} onOpenChange={setOpen}>
        <TrackedWalletHeader
          address={wallet.address}
          isRefreshing={isRefetching}
          lastUpdatedAt={lastUpdatedAt}
          onRefresh={refetchAll}
          onRemove={() => remove(wallet.publicKey)}
        />
        <CollapsibleContent
          animationDurationMs={400}
          sx={{ overflow: "hidden" }}
        >
          <SPortfolioChainsList sx={{ minHeight: 0 }}>
            {showNoBalances ? (
              <Text
                fs="p5"
                lh={1.4}
                color={getToken("text.medium")}
                sx={{ py: "xl", px: "primary", textWrap: "balance" }}
              >
                {t("myAssets.tracked.noBalances")}
              </Text>
            ) : (
              byChain.map(
                ({
                  chainKey,
                  chain,
                  balances,
                  total,
                  isLoading,
                  isError,
                  refetch,
                }) => (
                  <PortfolioChainSection
                    key={chainKey}
                    chain={chain}
                    balances={balances}
                    total={total}
                    isLoading={isLoading}
                    isError={isError}
                    refetch={refetch}
                    searchPhrase={searchPhrase}
                    sortingProps={sortingProps}
                    showDepositAction={false}
                  />
                ),
              )
            )}
          </SPortfolioChainsList>
        </CollapsibleContent>
      </CollapsibleRoot>
    </SPortfolioPaper>
  )
}
