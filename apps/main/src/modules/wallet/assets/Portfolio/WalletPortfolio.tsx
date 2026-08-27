import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Input,
  Paper,
  Separator,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalances.data"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"
import { SPortfolioTableWrapper } from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"
import { WalletPortfolioChainHeader } from "@/modules/wallet/assets/Portfolio/WalletPortfolioChainHeader"
import { WalletPortfolioOverview } from "@/modules/wallet/assets/Portfolio/WalletPortfolioOverview"

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
  const { assets, isAssetsLoading } = useWalletBalancesSectionData()

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

      <Paper>
        <CollapsibleRoot defaultOpen>
          <CollapsibleTrigger asChild>
            <WalletPortfolioChainHeader
              totalDisplay={t("common:currency", { value: assets })}
              isLoading={isAssetsLoading}
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
      </Paper>
    </Flex>
  )
}
