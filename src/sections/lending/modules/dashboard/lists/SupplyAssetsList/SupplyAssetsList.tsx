import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import BigNumber from "bignumber.js"
import { Fragment, useState } from "react"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { Warning } from "sections/lending/components/primitives/Warning"
import { MarketWarning } from "sections/lending/components/transactions/Warnings/MarketWarning"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { useRootStore } from "sections/lending/store/root"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"

import { ListWrapper } from "sections/lending/components/lists/ListWrapper"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"
import { DashboardListTopPanel } from "sections/lending/modules/dashboard/DashboardListTopPanel"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListLoader } from "sections/lending/modules/dashboard/lists/ListLoader"
import { SupplyAssetsListItem } from "./SupplyAssetsListItem"
import { SupplyAssetsListMobileItem } from "./SupplyAssetsListMobileItem"
import { WalletEmptyInfo } from "./WalletEmptyInfo"

const head = [
  { title: <span key="assets">Assets</span>, sortKey: "symbol" },
  {
    title: <span key="Wallet balance">Wallet balance</span>,
    sortKey: "walletBalance",
  },
  { title: <span key="APY">APY</span>, sortKey: "supplyAPY" },
  {
    title: <span key="Can be collateral">Can be collateral</span>,
    sortKey: "usageAsCollateralEnabledOnUser",
  },
]

export const SupplyAssetsList = () => {
  const currentNetworkConfig = useRootStore(
    (store) => store.currentNetworkConfig,
  )
  const currentChainId = useRootStore((store) => store.currentChainId)
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const currentMarket = useRootStore((store) => store.currentMarket)
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext()
  const { walletBalances, loading } = useWalletBalances(currentMarketData)
  const [displayGho] = useRootStore((store) => [store.displayGho])
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))

  const [sortName, setSortName] = useState("")
  const [sortDesc, setSortDesc] = useState(false)

  const {
    bridge,
    isTestnet,
    baseAssetSymbol,
    name: networkName,
  } = currentNetworkConfig

  const localStorageName = "showSupplyZeroAssets"
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === "true",
  )

  const tokensToSupply = reserves
    .filter(
      (reserve: ComputedReserveData) =>
        !(reserve.isFrozen || reserve.isPaused) &&
        !displayGho({ symbol: reserve.symbol, currentMarket }),
    )
    .map((reserve: ComputedReserveData) => {
      const walletBalance = walletBalances[reserve.underlyingAsset]?.amount
      const walletBalanceUSD =
        walletBalances[reserve.underlyingAsset]?.amountUSD
      let availableToDeposit = valueToBigNumber(walletBalance)
      if (reserve.supplyCap !== "0") {
        availableToDeposit = BigNumber.min(
          availableToDeposit,
          new BigNumber(reserve.supplyCap)
            .minus(reserve.totalLiquidity)
            .multipliedBy("0.995"),
        )
      }
      const availableToDepositUSD = valueToBigNumber(availableToDeposit)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketReferencePriceInUsd)
        .shiftedBy(-USD_DECIMALS)
        .toString()

      const isIsolated = reserve.isIsolated
      const hasDifferentCollateral = user?.userReservesData.find(
        (userRes) =>
          userRes.usageAsCollateralEnabledOnUser &&
          userRes.reserve.id !== reserve.id,
      )

      const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
        ? reserve.reserveLiquidationThreshold !== "0" &&
          (!isIsolated || (isIsolated && !hasDifferentCollateral))
        : !isIsolated
        ? false
        : !hasDifferentCollateral

      if (reserve.isWrappedBaseAsset) {
        let baseAvailableToDeposit = valueToBigNumber(
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
        )
        if (reserve.supplyCap !== "0") {
          baseAvailableToDeposit = BigNumber.min(
            baseAvailableToDeposit,
            new BigNumber(reserve.supplyCap)
              .minus(reserve.totalLiquidity)
              .multipliedBy("0.995"),
          )
        }
        const baseAvailableToDepositUSD = valueToBigNumber(
          baseAvailableToDeposit,
        )
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toString()
        return [
          {
            ...reserve,
            reserve,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            ...fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            }),
            walletBalance:
              walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
            walletBalanceUSD:
              walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
            availableToDeposit: baseAvailableToDeposit.toString(),
            availableToDepositUSD: baseAvailableToDepositUSD,
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
            id: reserve.id + "base",
          },
          {
            ...reserve,
            reserve,
            walletBalance,
            walletBalanceUSD,
            availableToDeposit:
              availableToDeposit.toNumber() <= 0
                ? "0"
                : availableToDeposit.toString(),
            availableToDepositUSD:
              Number(availableToDepositUSD) <= 0
                ? "0"
                : availableToDepositUSD.toString(),
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
          },
        ]
      }

      return {
        ...reserve,
        reserve,
        walletBalance,
        walletBalanceUSD,
        availableToDeposit:
          availableToDeposit.toNumber() <= 0
            ? "0"
            : availableToDeposit.toString(),
        availableToDepositUSD:
          Number(availableToDepositUSD) <= 0
            ? "0"
            : availableToDepositUSD.toString(),
        usageAsCollateralEnabledOnUser,
        detailsAddress: reserve.underlyingAsset,
      }
    })
    .flat()

  const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
    +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1,
  )
  const filteredSupplyReserves = sortedSupplyReserves.filter(
    (reserve) => reserve.availableToDepositUSD !== "0",
  )

  // Filter out reserves
  const supplyReserves: unknown = isShowZeroAssets
    ? sortedSupplyReserves
    : filteredSupplyReserves.length >= 1
    ? filteredSupplyReserves
    : sortedSupplyReserves

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = supplyReserves as DashboardReserve[]
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "assets",
    preSortedReserves,
  )

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === "symbol"}
            maxWidth={
              col.sortKey === "symbol"
                ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET
                : undefined
            }
            key={col.sortKey}
            overFlow={"visible"}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source="Supplies Dashbaord"
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    )
  }

  if (loadingReserves || loading)
    return (
      <ListLoader
        head={head.map((col) => col.title)}
        title="Assets to supply"
        withTopMargin
      />
    )

  const supplyDisabled = !tokensToSupply.length

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 16 }}>
          <span>Assets to supply</span>
        </Typography>
      }
      localStorageName="supplyAssetsDashboardTableCollapse"
      withTopMargin
      noData={supplyDisabled}
      subChildrenComponent={
        <>
          <Box sx={{ px: 6 }}>
            {supplyDisabled && currentNetworkConfig.name === "Harmony" ? (
              <MarketWarning marketName="Harmony" />
            ) : supplyDisabled && currentNetworkConfig.name === "Fantom" ? (
              <MarketWarning marketName="Fantom" />
            ) : supplyDisabled &&
              currentMarketData.marketTitle === "Ethereum AMM" ? (
              <MarketWarning marketName="Ethereum AMM" />
            ) : user?.isInIsolationMode ? (
              <Warning variant="warning">
                <span>
                  Collateral usage is limited because of isolation mode.{" "}
                  <Link
                    href="https://docs.aave.com/faq/"
                    target="_blank"
                    rel="noopener"
                  >
                    Learn More
                  </Link>
                </span>
              </Warning>
            ) : (
              filteredSupplyReserves.length === 0 &&
              (isTestnet ? (
                <Warning variant="info">
                  <span>
                    Your {networkName} wallet is empty. Get free test assets at{" "}
                  </span>{" "}
                  <Link href={ROUTES.faucet} style={{ fontWeight: 400 }}>
                    <span>{networkName} Faucet</span>
                  </Link>
                </Warning>
              ) : (
                <WalletEmptyInfo
                  name={networkName}
                  bridge={bridge}
                  chainId={currentChainId}
                />
              ))
            )}
          </Box>

          {filteredSupplyReserves.length >= 1 && (
            <DashboardListTopPanel
              value={isShowZeroAssets}
              onClick={setIsShowZeroAssets}
              localStorageName={localStorageName}
              bridge={bridge}
            />
          )}
        </>
      }
    >
      <>
        {!downToXSM && !!sortedReserves && !supplyDisabled && <RenderHeader />}
        {sortedReserves.map((item) => (
          <Fragment key={item.underlyingAsset}>
            <AssetCapsProvider asset={item.reserve}>
              {downToXSM ? (
                <SupplyAssetsListMobileItem {...item} key={item.id} />
              ) : (
                <SupplyAssetsListItem {...item} key={item.id} />
              )}
            </AssetCapsProvider>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  )
}
