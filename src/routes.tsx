import { Navigate } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"

import { Suspense, lazy } from "react"
import { SwapPageSkeleton } from "sections/trade/skeleton/SwapPageSkeleton"

const isDevelopment = import.meta.env.VITE_ENV === "development"

const TradePage = lazy(async () => ({
  default: (await import("sections/trade/TradePage")).TradePage,
}))

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

const WalletPage = lazy(async () => ({
  default: (await import("sections/wallet/WalletPage")).WalletPage,
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

const PoolsPage = lazy(async () => ({
  default: (await import("sections/pools/PoolsPage")).PoolsPage,
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

const BridgePage = lazy(async () => ({
  default: (await import("sections/xcm/BridgePage")).BridgePage,
}))

const StatsPage = lazy(async () => ({
  default: (await import("sections/stats/StatsPage")).StatsPage,
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

export const routes = [
  {
    path: "/",
    element: <Navigate to="/trade/swap" />,
  },
  {
    path: "trade",
    element: (
      <Suspense>
        <TradePage />
      </Suspense>
    ),
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
          <Suspense>
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
          <Suspense>
            <BondsPageWrapper />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "wallet",
    element: (
      <Suspense>
        <WalletPage />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="assets" fromCurrent />,
      },
      {
        path: "assets",
        element: (
          <Suspense>
            <WalletAssets />
          </Suspense>
        ),
      },
      {
        path: "vesting",
        element: (
          <Suspense>
            <WalletVesting />
          </Suspense>
        ),
      },
      ...(isDevelopment
        ? [
            {
              path: "transactions",
              element: (
                <Suspense>
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
    element: (
      <Suspense>
        <PoolsPage />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="all-pools" />,
      },
      {
        path: "my-liquidity",
        element: (
          <Suspense>
            <MyLiquidity />
          </Suspense>
        ),
      },
      {
        path: "all-pools",
        element: (
          <Suspense>
            <AllPools />
          </Suspense>
        ),
      },
      {
        path: "omnipool-stablepools",
        element: (
          <Suspense>
            <OmnipoolAndStablepool />
          </Suspense>
        ),
      },
      {
        path: "isolated",
        element: (
          <Suspense>
            <IsolatedPools />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "cross-chain",
    element: (
      <Page>
        <Suspense>
          <XcmPage />
        </Suspense>
      </Page>
    ),
  },
  {
    path: "bridge",
    element: (
      <Suspense>
        <BridgePage />
      </Suspense>
    ),
  },
  {
    path: "stats",
    element: (
      <Suspense>
        <StatsPage />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="overview" />,
      },
      {
        path: "overview",
        element: (
          <Suspense>
            <StatsOverview />
          </Suspense>
        ),
      },
      {
        path: "treasury",
        element: (
          <Suspense>
            <StatsPOL />
          </Suspense>
        ),
      },
      {
        path: "asset",
        element: (
          <Suspense>
            <StatsOmnipoolAsset />
          </Suspense>
        ),
      },

      // TODO: Not ready. Requested in #861n9ffe4
      // {
      //   path: "LRNA",
      //   element: <StatsPage />,
      // },
    ],
  },
  {
    path: "staking",
    element: (
      <Suspense>
        <StakingPage />
      </Suspense>
    ),
  },
  {
    path: "referrals",
    element: (
      <Suspense>
        <ReferralsWrapper />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
