import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Input,
  Separator,
  Text,
  TextButton,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import {
  HYDRATION_PARACHAIN_ID,
  isAddressValidOnHydration,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMultichainPortfolio } from "@/api/portfolio"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalances.data"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"
import { TrackedWallets } from "@/modules/wallet/assets/Portfolio/TrackedWallets"
import {
  SPortfolioPaper,
  SPortfolioTableWrapper,
} from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"
import { WalletPortfolioChainHeader } from "@/modules/wallet/assets/Portfolio/WalletPortfolioChainHeader"
import { WalletPortfolioChainSection } from "@/modules/wallet/assets/Portfolio/WalletPortfolioChainSection"
import { WalletPortfolioOverview } from "@/modules/wallet/assets/Portfolio/WalletPortfolioOverview"
import { useTrackedWallets } from "@/states/trackedWallets"

export const walletPortfolioTabs = ["assets", "liquidity", "bonds"] as const

type Props = {
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
  readonly sortingProps: SortingProps
  readonly liquidityContent: ReactNode
  readonly bondsContent: ReactNode
}

export const WalletPortfolio: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
  sortingProps,
  liquidityContent,
  bondsContent,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const [showAllAssets, setShowAllAssets] = useState(false)

  const { category: activeTab } = useSearch({ from: "/wallet/assets" })

  const { data, hasSmallBalances, isEmpty, isLoading } =
    useMyAssetsTableData(showAllAssets)
  const {
    assets,
    isAssetsLoading,
    liquidity,
    isLiquidityLoading,
    borrow,
    isBorrowLoading,
  } = useWalletBalancesSectionData()

  const netWorth = useMemo(
    () =>
      Big(assets || 0)
        .plus(liquidity || 0)
        .minus(borrow || 0)
        .toString(),
    [assets, borrow, liquidity],
  )

  const { account } = useAccount()
  const isHydrationValid = account
    ? isAddressValidOnHydration(account.rawAddress)
    : false
  const showOtherChains = !isHydrationValid || activeTab === "assets"
  const { byChain } = useMultichainPortfolio(
    account ? [account.rawAddress] : [],
  )
  const trackedWallets = useTrackedWallets()
  const queryClient = useQueryClient()

  return (
    <Flex direction="column" gap="l">
      <Flex
        align={["stretch", null, "center"]}
        justify="space-between"
        gap="base"
        direction={["column", null, "row"]}
      >
        <Text as="h2" font="primary" fs="h7" fw={500}>
          {t("myAssets.title")}
        </Text>
        <Flex
          align={["stretch", null, "center"]}
          gap="l"
          direction={["column-reverse", null, "row"]}
          width={["100%", null, "auto"]}
        >
          {hasSmallBalances && (
            <ToggleRoot
              width={["100%", null, "auto"]}
              justify={["space-between", null, "flex-start"]}
            >
              <ToggleLabel>{t("myAssets.showSmallBalances")}</ToggleLabel>
              <Toggle
                checked={showAllAssets}
                onCheckedChange={() =>
                  setShowAllAssets((showAllAssets) => !showAllAssets)
                }
              />
            </ToggleRoot>
          )}
          <Input
            value={searchPhrase}
            placeholder={t("common:search.placeholder.assets")}
            iconStart={Search}
            width={["100%", null, "4xl"]}
            onChange={(e) => onSearchPhraseChange(e.target.value)}
          />
        </Flex>
      </Flex>

      <SPortfolioPaper>
        {isHydrationValid && (
          <CollapsibleRoot defaultOpen>
            <CollapsibleTrigger asChild>
              <WalletPortfolioChainHeader
                isExpandable
                name="Hydration"
                chainId={HYDRATION_PARACHAIN_ID}
                totalDisplay={t("common:currency", { value: netWorth })}
                isLoading={
                  isAssetsLoading || isLiquidityLoading || isBorrowLoading
                }
              />
            </CollapsibleTrigger>
            <CollapsibleContent
              forceMount
              animationDurationMs={400}
              sx={{ overflow: "hidden" }}
            >
              <Box sx={{ minHeight: 0 }}>
                <WalletPortfolioOverview />
                <Separator />
                <TabMenu
                  gap="base"
                  p="m"
                  horizontalEdgeOffset="xl"
                  items={walletPortfolioTabs.map<TabItem>((category) => ({
                    to: "/wallet/assets",
                    title: t(`myAssets.tabs.${category}`),
                    search: { category },
                    resetScroll: false,
                  }))}
                  renderItem={(item) => (
                    <TabMenuItem size="small" item={item} variant="muted" />
                  )}
                />
                <Separator />
                <SPortfolioTableWrapper>
                  {activeTab === "assets" && (
                    <MyAssets
                      data={data}
                      isEmpty={isEmpty}
                      isLoading={isLoading}
                      searchPhrase={searchPhrase}
                      sortingProps={sortingProps}
                    />
                  )}
                  {activeTab === "liquidity" && liquidityContent}
                  {activeTab === "bonds" && bondsContent}
                </SPortfolioTableWrapper>
              </Box>
            </CollapsibleContent>
          </CollapsibleRoot>
        )}
        {showOtherChains &&
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
              <WalletPortfolioChainSection
                key={chainKey}
                chain={chain}
                balances={balances}
                total={total}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                searchPhrase={searchPhrase}
                sortingProps={sortingProps}
              />
            ),
          )}
      </SPortfolioPaper>

      {showOtherChains && (
        <Box mt="xxl">
          <TrackedWallets
            searchPhrase={searchPhrase}
            sortingProps={sortingProps}
          />
        </Box>
      )}

      {showOtherChains && (byChain.length > 0 || trackedWallets.length > 0) && (
        <Flex justify="flex-end">
          <TextButton
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["portfolio", "balances"],
              })
            }
          >
            {t("myAssets.otherChains.refresh")}
          </TextButton>
        </Flex>
      )}
    </Flex>
  )
}
