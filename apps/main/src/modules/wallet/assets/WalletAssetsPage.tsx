import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Grid, Input } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BorrowContextProvider } from "@/modules/borrow/BorrowContextProvider"
import { WalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { useMyLiquidityTableData } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { WalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewards"
import { WalletAssetsSubpageMenu } from "@/modules/wallet/assets/WalletAssetsSubpageMenu"
import { OmnipoolSubscriber } from "@/routes/liquidity/route"

export const WalletAssetsPage = () => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()
  const [searchPhrase, setSearchPhrase] = useState("")

  const { category } = useSearch({
    from: "/wallet/assets",
  })

  useEffect(() => {
    setSearchPhrase("")
  }, [isMobile])

  const { data: liquidityData, isLoading: liquidityLoading } =
    useMyLiquidityTableData()

  if (!account) {
    // TODO add real fallback, this is placeholder
    return <Web3ConnectButton size="large" />
  }

  return (
    <>
      <OmnipoolSubscriber />
      <BorrowContextProvider>
        <Flex direction="column" gap={[0, 20]}>
          <Grid
            columnGap={[10, 20]}
            sx={{ gridTemplateColumns: "2fr 1fr", overflowX: "auto" }}
          >
            <WalletBalances />
            <WalletRewards />
          </Grid>
          {!isMobile && (
            <Flex pt={12} align="flex-end" justify="space-between">
              <WalletAssetsSubpageMenu />
              <Input
                placeholder={t("search.placeholder.assets")}
                iconStart={Search}
                onChange={(e) => setSearchPhrase(e.target.value)}
              />
            </Flex>
          )}
          <Flex direction="column" gap={12}>
            {(isMobile || category === "all" || category === "assets") && (
              <MyAssets searchPhrase={searchPhrase} sx={{ pt: 8 }} />
            )}
            {(((isMobile || category === "all") && liquidityData.length > 0) ||
              category === "liquidity") && (
              <MyLiquidity
                data={liquidityData}
                isLoading={liquidityLoading}
                searchPhrase={searchPhrase}
              />
            )}
          </Flex>
        </Flex>
      </BorrowContextProvider>
    </>
  )
}
