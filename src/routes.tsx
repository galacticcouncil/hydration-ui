import { Navigate, Route } from "@tanstack/react-location"
import { HeaderValuesSkeleton } from "components/Skeleton/HeaderValuesSkeleton"
import { InputSkeleton } from "components/Skeleton/InputSkeleton"
import { TableSkeleton } from "components/Skeleton/TableSkeleton"

import { Suspense, lazy } from "react"
import { DepositPageSkeleton } from "sections/deposit/DepositPageSkeleton"
import { LendingDashboardSkeleton } from "sections/lending/skeleton/LendingDashboardSkeleton"
import { LendingMarketsSkeleton } from "sections/lending/skeleton/LendingMarketsSkeleton"
import { LendingReserveOverviewSkeleton } from "sections/lending/skeleton/LendingReserveOverviewSkeleton"
import { MemepadPageSkeleton } from "sections/memepad/skeleton/MemepadPageSkeleton"
import { ReferralsSkeleton } from "sections/referrals/ReferralsSkeleton"
import { StatsAssetPageSkeleton } from "sections/stats/skeleton/StatsAssetPageSkeleton"
import { StatsPageSkeleton } from "sections/stats/skeleton/StatsPageSkeleton"
import { BondsPageSkeleton } from "sections/trade/sections/bonds/BondsPageSkeleton"
import { SwapAppSkeleton } from "sections/trade/skeleton/SwapAppSkeleton"
import { SwapPageSkeleton } from "sections/trade/skeleton/SwapPageSkeleton"
import { LINKS } from "utils/navigation"

const isDevelopment = import.meta.env.VITE_ENV === "development"

const SwapPage = lazy(async () => ({
  default: (await import("sections/trade/sections/swap/SwapPage")).SwapPage,
}))

const DcaPage = lazy(async () => ({
  default: (await import("sections/trade/sections/dca/DcaPage")).DcaPage,
}))

const OtcPageWrapper = lazy(async () => ({
  default: (await import("sections/trade/sections/otc/OtcPageWrappet"))
    .OtcPageWrapper,
}))

const YieldDcaPage = lazy(async () => ({
  default: (await import("sections/trade/sections/yieldDca/YieldDcaPage"))
    .YieldDcaPage,
}))

const BondsPageWrapper = lazy(async () => ({
  default: (await import("sections/trade/sections/bonds/BondsPageWrapper"))
    .BondsPageWrapper,
}))

const BondDetailsPage = lazy(async () => ({
  default: (
    await import("sections/trade/sections/bonds/details/BondDetailsPage")
  ).BondDetailsPage,
}))

const WalletTransactions = lazy(async () => ({
  default: (await import("sections/wallet/transactions/WalletTransactions"))
    .WalletTransactions,
}))

const WalletAssets = lazy(async () => ({
  default: (await import("sections/wallet/assets/WalletAssets")).WalletAssets,
}))

const WalletVesting = lazy(async () => ({
  default: (await import("sections/wallet/vesting/WalletVesting"))
    .WalletVesting,
}))

const AllPools = lazy(async () => ({
  default: (await import("sections/pools/sections/AllPools")).AllPools,
}))

const MyLiquidity = lazy(async () => ({
  default: (await import("sections/pools/sections/MyLiquidity")).MyLiquidity,
}))

const OmnipoolAndStablepool = lazy(async () => ({
  default: (await import("sections/pools/sections/OmnipoolAndStablepool"))
    .OmnipoolAndStablepool,
}))

const IsolatedPools = lazy(async () => ({
  default: (await import("sections/pools/sections/IsolatedPools"))
    .IsolatedPools,
}))

const XcmPage = lazy(async () => ({
  default: (await import("sections/xcm/XcmPage")).XcmPage,
}))

const StatsOverview = lazy(async () => ({
  default: (await import("sections/stats/sections/overview/StatsOverview"))
    .StatsOverview,
}))

const StatsPOL = lazy(async () => ({
  default: (await import("sections/stats/sections/POL/StatsPOL")).StatsPOL,
}))

const StatsOmnipoolAsset = lazy(async () => ({
  default: (
    await import("sections/stats/sections/omnipoolAsset/StatsOmnipoolAsset")
  ).StatsOmnipoolAsset,
}))

const StakingPage = lazy(async () => ({
  default: (await import("sections/staking/StakingPage")).StakingPage,
}))

const ReferralsWrapper = lazy(async () => ({
  default: (await import("sections/referrals/ReferralsPage")).ReferralsWrapper,
}))

const SubmitTransaction = lazy(async () => ({
  default: (await import("sections/submit-transaction/SubmitTransaction"))
    .SubmitTransaction,
}))

const MemepadPage = lazy(async () => ({
  default: (await import("sections/memepad/MemepadPage")).MemepadPage,
}))
const LendingPage = lazy(async () => ({
  default: (await import("sections/lending/LendingPage")).LendingPage,
}))

const LendingPageIndex = lazy(async () => ({
  default: (await import("sections/lending/LendingPage")).LendingPageIndex,
}))

const LendingDashboardPage = lazy(async () => ({
  default: (await import("sections/lending/LendingDashboardPage"))
    .LendingDashboardPage,
}))

const LendingMarketsPage = lazy(async () => ({
  default: (await import("sections/lending/LendingMarketsPage"))
    .LendingMarketsPage,
}))

const LendingReserveOverviewPage = lazy(async () => ({
  default: (await import("sections/lending/LendingReserveOverviewPage"))
    .LendingReserveOverviewPage,
}))

const DepositPage = lazy(async () => ({
  default: (await import("sections/deposit/DepositPage")).DepositPage,
}))

const WithdrawPage = lazy(async () => ({
  default: (await import("sections/deposit/WithdrawPage")).WithdrawPage,
}))

export const routes: Route[] = [
  {
    path: "/",
    element: <Navigate to="/trade/swap" />,
  },
  {
    path: "trade",
    children: [
      {
        path: "/",
        element: <Navigate to="swap" />,
      },
      {
        path: "swap",
        element: (
          <Suspense fallback={<SwapPageSkeleton />}>
            <SwapPage />
          </Suspense>
        ),
      },
      {
        path: "otc",
        element: (
          <Suspense
            fallback={
              <>
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <OtcPageWrapper />
          </Suspense>
        ),
      },
      {
        path: "yield-dca",
        element: (
          <Suspense fallback={<SwapPageSkeleton />}>
            <YieldDcaPage />
          </Suspense>
        ),
      },
      {
        path: "dca",
        element: (
          <Suspense fallback={<SwapPageSkeleton />}>
            <DcaPage />
          </Suspense>
        ),
      },
      {
        path: "bond",
        element: (
          <Suspense fallback={<SwapPageSkeleton />}>
            <BondDetailsPage />
          </Suspense>
        ),
      },
      {
        path: "bonds",
        element: (
          <Suspense fallback={<BondsPageSkeleton />}>
            <BondsPageWrapper />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "wallet",
    children: [
      {
        path: "/",
        element: <Navigate to="assets" fromCurrent />,
      },
      {
        path: "assets",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton size="large" sx={{ mb: [20, 40] }} />
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <WalletAssets />
          </Suspense>
        ),
      },
      {
        path: "vesting",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton
                  count={1}
                  size="extra-large"
                  sx={{ mb: [20, 40] }}
                />
                <TableSkeleton />
              </>
            }
          >
            <WalletVesting />
          </Suspense>
        ),
      },
      ...(isDevelopment
        ? [
            {
              path: "transactions",
              element: (
                <Suspense
                  fallback={
                    <>
                      <InputSkeleton sx={{ mb: 20 }} />
                      <TableSkeleton />
                    </>
                  }
                >
                  <WalletTransactions />
                </Suspense>
              ),
            },
          ]
        : []),
    ],
  },
  {
    path: "liquidity",
    children: [
      {
        path: "/",
        element: <Navigate to="all-pools" />,
      },
      {
        path: "my-liquidity",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton sx={{ mb: [20, 40] }} />
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <MyLiquidity />
          </Suspense>
        ),
      },
      {
        path: "all-pools",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton sx={{ mb: [20, 40] }} />
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <AllPools />
          </Suspense>
        ),
      },
      {
        path: "omnipool-stablepools",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton sx={{ mb: [20, 40] }} />
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <OmnipoolAndStablepool />
          </Suspense>
        ),
      },
      {
        path: "isolated",
        element: (
          <Suspense
            fallback={
              <>
                <HeaderValuesSkeleton sx={{ mb: [20, 40] }} />
                <InputSkeleton sx={{ mb: 20 }} />
                <TableSkeleton />
              </>
            }
          >
            <IsolatedPools />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "cross-chain",
    element: (
      <Suspense
        fallback={<SwapAppSkeleton sx={{ maxWidth: 570, mx: "auto" }} />}
      >
        <XcmPage />
      </Suspense>
    ),
  },
  {
    path: "stats",
    children: [
      {
        path: "/",
        element: <Navigate to="overview" />,
      },
      {
        path: "overview",
        element: (
          <Suspense fallback={<StatsPageSkeleton />}>
            <StatsOverview />
          </Suspense>
        ),
      },
      {
        path: "treasury",
        element: (
          <Suspense fallback={<StatsPageSkeleton />}>
            <StatsPOL />
          </Suspense>
        ),
      },
      {
        path: "asset",
        element: (
          <Suspense fallback={<StatsAssetPageSkeleton />}>
            <StatsOmnipoolAsset />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "staking",
    element: (
      <Suspense fallback={<SwapPageSkeleton />}>
        <StakingPage />
      </Suspense>
    ),
  },
  {
    path: "referrals",
    element: (
      <Suspense fallback={<ReferralsSkeleton />}>
        <ReferralsWrapper />
      </Suspense>
    ),
  },
  {
    path: LINKS.submitTransaction,
    element: (
      <Suspense fallback={null}>
        <SubmitTransaction />
      </Suspense>
    ),
  },
  {
    path: LINKS.memepad,
    element: (
      <Suspense fallback={<MemepadPageSkeleton />}>
        <MemepadPage />
      </Suspense>
    ),
  },
  {
    path: LINKS.borrow,
    element: (
      <Suspense fallback={<LendingDashboardSkeleton />}>
        <LendingPage />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<LendingDashboardSkeleton />}>
            <LendingPageIndex />
          </Suspense>
        ),
      },
      {
        path: LINKS.borrowDashboard.split("/").pop(),
        element: (
          <Suspense fallback={<LendingDashboardSkeleton />}>
            <LendingDashboardPage />
          </Suspense>
        ),
      },
      {
        path: LINKS.borrowMarkets.split("/").pop(),
        children: [
          {
            path: "/",
            element: (
              <Suspense fallback={<LendingMarketsSkeleton />}>
                <LendingMarketsPage />
              </Suspense>
            ),
          },
          {
            path: ":underlyingAsset",
            element: async ({ params: { underlyingAsset } }) => (
              <Suspense fallback={<LendingReserveOverviewSkeleton />}>
                <LendingReserveOverviewPage underlyingAsset={underlyingAsset} />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: LINKS.deposit,
    element: (
      <Suspense fallback={<DepositPageSkeleton />}>
        <DepositPage />
      </Suspense>
    ),
  },
  {
    path: LINKS.withdraw,
    element: (
      <Suspense fallback={<DepositPageSkeleton />}>
        <WithdrawPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
