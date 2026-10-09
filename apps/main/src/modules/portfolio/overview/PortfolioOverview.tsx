import { ChevronDown, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  Input,
  Separator,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_PARACHAIN_ID,
  isAddressValidOnHydration,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, Fragment, ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMultichainPortfolio } from "@/api/portfolio"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { useWalletBalancesSectionData } from "@/modules/portfolio/overview/Balances/WalletBalances.data"
import { MyAssets } from "@/modules/portfolio/overview/MyAssets/MyAssets"
import { useMyAssetsTableData } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.data"
import { PortfolioChainHeader } from "@/modules/portfolio/overview/PortfolioChainHeader"
import { PortfolioChainSection } from "@/modules/portfolio/overview/PortfolioChainSection"
import {
  SPortfolioPaper,
  SPortfolioSubsectionHeaderButton,
  SPortfolioTableWrapper,
} from "@/modules/portfolio/overview/PortfolioOverview.styled"
import { PortfolioSummary } from "@/modules/portfolio/overview/PortfolioSummary"

export const portfolioOverviewTabs = [
  "all",
  "assets",
  "strategies",
  "liquidity",
  "bonds",
] as const

type Props = {
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
  readonly sortingProps: SortingProps
  readonly liquidityContent: ReactNode
  readonly bondsContent: ReactNode
  readonly strategiesContent: ReactNode
}

export const PortfolioOverview: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
  sortingProps,
  liquidityContent,
  bondsContent,
  strategiesContent,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const [showAllAssets, setShowAllAssets] = useState(false)

  const { category: activeTab } = useSearch({ from: "/portfolio/" })

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
  const showOtherChains =
    !isHydrationValid || activeTab === "assets" || activeTab === "all"
  const { byChain } = useMultichainPortfolio(
    account ? [account.rawAddress] : [],
  )

  const sections = [
    {
      category: "assets",
      content: (
        <MyAssets
          data={data}
          isEmpty={isEmpty}
          isLoading={isLoading}
          searchPhrase={searchPhrase}
          sortingProps={sortingProps}
        />
      ),
    },
    { category: "strategies", content: strategiesContent },
    { category: "liquidity", content: liquidityContent },
    { category: "bonds", content: bondsContent },
  ] as const

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

      <SPortfolioPaper data-all={activeTab === "all" ? "" : undefined}>
        {isHydrationValid && (
          <CollapsibleRoot defaultOpen>
            <CollapsibleTrigger asChild>
              <PortfolioChainHeader
                isExpandable
                name="Hydration"
                chainId={HYDRATION_PARACHAIN_ID}
                totalDisplay={t("common:currency", { value: netWorth })}
                replaceLogoWhenLoading={false}
                isLoading={
                  isAssetsLoading || isLiquidityLoading || isBorrowLoading
                }
              />
            </CollapsibleTrigger>
            <CollapsibleContent
              forceMount
              animationDurationMs={400}
              sx={{ overflow: activeTab === "all" ? "clip" : "hidden" }}
            >
              <Box sx={{ minHeight: 0 }}>
                <PortfolioSummary />
                <Separator />
                <TabMenu
                  gap="base"
                  p="m"
                  horizontalEdgeOffset="xl"
                  items={portfolioOverviewTabs.map<TabItem>((category) => ({
                    to: "/portfolio/",
                    title:
                      category === "all"
                        ? t("common:all")
                        : t(`myAssets.tabs.${category}`),
                    search: { category },
                    resetScroll: false,
                  }))}
                  renderItem={(item) => (
                    <TabMenuItem size="small" item={item} variant="muted" />
                  )}
                />
                <Separator />
                <SPortfolioTableWrapper
                  data-all={activeTab === "all" ? "" : undefined}
                >
                  {sections
                    .filter(
                      ({ category }) =>
                        activeTab === "all" || activeTab === category,
                    )
                    .map(({ category, content }, index) => (
                      <Fragment key={category}>
                        {activeTab === "all" ? (
                          <Box as="section">
                            {index > 0 && <Separator />}
                            <CollapsibleRoot defaultOpen>
                              <CollapsibleTrigger asChild>
                                <SPortfolioSubsectionHeaderButton
                                  type="button"
                                  isExpandable
                                >
                                  <Text
                                    fs="p6"
                                    fw={600}
                                    color={getToken("text.high")}
                                  >
                                    {t(`myAssets.tabs.${category}`)}
                                  </Text>
                                  <Icon
                                    size="s"
                                    component={ChevronDown}
                                    data-chevron
                                  />
                                </SPortfolioSubsectionHeaderButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent
                                forceMount
                                animationDurationMs={400}
                                sx={{ overflow: "hidden" }}
                              >
                                <Box sx={{ minHeight: 0 }}>{content}</Box>
                              </CollapsibleContent>
                            </CollapsibleRoot>
                          </Box>
                        ) : (
                          content
                        )}
                      </Fragment>
                    ))}
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
              />
            ),
          )}
      </SPortfolioPaper>
    </Flex>
  )
}
