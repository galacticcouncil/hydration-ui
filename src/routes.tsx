import { WalletPage } from "./sections/wallet/WalletPage"
import { Navigate } from "@tanstack/react-location"
import { XcmPage } from "sections/xcm/XcmPage"
import { PoolsPage } from "sections/pools/PoolsPage"
import { StakingPage } from "./sections/staking/StakingPage"
import { TradePage } from "sections/trade/TradePage"

import { AllPools } from "sections/pools/sections/AllPools"
import { MyLiquidity } from "sections/pools/sections/MyLiquidity"
import { OmnipoolAndStablepool } from "sections/pools/sections/OmnipoolAndStablepool"
import { IsolatedPools } from "sections/pools/sections/IsolatedPools"
import { ReferralsWrapper } from "sections/referrals/ReferralsPage"
import { StatsPOL } from "sections/stats/sections/POL/StatsPOL"
import { StatsOmnipoolAsset } from "sections/stats/sections/omnipoolAsset/StatsOmnipoolAsset"
import { BridgePage } from "sections/xcm/BridgePage"

import { Suspense, lazy } from "react"
import { SwapPageSkeleton } from "sections/trade/skeleton/SwapPageSkeleton"
import { OtcPageSkeleton } from "sections/trade/sections/otc/OtcPageSkeleton"
import { BondsPageSkeleton } from "sections/trade/sections/bonds/BondsPageSkeleton"
import { BondDetailsSkeleton } from "sections/trade/sections/bonds/details/BondDetailsSkeleton"

const isDevelopment = import.meta.env.VITE_ENV === "development"

const StatsOverview = lazy(async () => ({
  default: (await import("sections/stats/sections/overview/StatsOverview"))
    .StatsOverview,
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

export const routes = [
  {
    path: "/",
    element: <Navigate to="/trade/swap" />,
  },
  {
    path: "trade",
    element: <TradePage />,
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
          <Suspense fallback={<OtcPageSkeleton />}>
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
        element: <WalletPage />,
      },
      {
        path: "vesting",
        element: <WalletPage />,
      },
      ...(isDevelopment
        ? [
            {
              path: "transactions",
              element: <WalletPage />,
            },
          ]
        : []),
    ],
  },
  {
    path: "liquidity",
    element: <PoolsPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="all-pools" />,
      },
      {
        path: "my-liquidity",
        element: <MyLiquidity />,
      },
      {
        path: "all-pools",
        element: <AllPools />,
      },
      {
        path: "omnipool-stablepools",
        element: <OmnipoolAndStablepool />,
      },
      {
        path: "isolated",
        element: <IsolatedPools />,
      },
    ],
  },
  {
    path: "cross-chain",
    element: <XcmPage />,
  },
  {
    path: "bridge",
    element: <BridgePage />,
  },
  {
    path: "stats",
    element: () =>
      import("sections/stats/StatsPage").then((mod) => <mod.StatsPage />),
    children: [
      {
        path: "/",
        element: <Navigate to="overview" />,
      },
      {
        path: "overview",
        element: (
          <Suspense fallback={"LOADING"}>{/* <StatsOverview /> */}</Suspense>
        ),
      },
      {
        path: "treasury",
        element: <StatsPOL />,
      },
      {
        path: "asset",
        element: <StatsOmnipoolAsset />,
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
    element: <StakingPage />,
  },
  {
    path: "referrals",
    element: <ReferralsWrapper />,
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
