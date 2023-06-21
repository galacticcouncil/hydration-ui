import { WalletPage } from "./sections/wallet/WalletPage"

import { Navigate } from "@tanstack/react-location"
import { TradePage } from "sections/trade/TradePage"
import { XcmPage } from "sections/xcm/XcmPage"

import { OtcPageWrapper } from "sections/otc/OtcPageWrappet"
import { PoolsPage } from "sections/pools/PoolsPage"
import { StatsPage } from "sections/stats/StatsPage"
import { DcaPage } from "sections/dca/DcaPage"
import { StakingPage } from "./sections/staking/StakingPage"

export const routes = [
  {
    path: "/",
    element: <Navigate to="/trade" />,
  },
  {
    path: "trade",
    element: <TradePage />,
  },
  {
    path: "dca",
    element: <DcaPage />,
  },
  {
    path: "wallet",
    children: [
      {
        path: "/",
        element: <Navigate to="assets" />,
      },
      {
        path: "assets",
        element: <WalletPage />,
      },
      {
        path: "vesting",
        element: <WalletPage />,
      },
    ],
  },
  {
    path: "liquidity",
    element: <PoolsPage />,
  },
  {
    path: "cross-chain",
    element: <XcmPage />,
  },
  {
    path: "otc",
    element: <OtcPageWrapper />,
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
        element: <StatsPage />,
      },
      {
        path: "POL",
        element: <StatsPage />,
      },
      {
        path: "LRNA",
        element: <StatsPage />,
      },
    ],
  },
  {
    path: "staking",
    children: [
      {
        path: "/",
        element: <Navigate to="dashboard" />,
      },
      {
        path: "dashboard",
        element: <StakingPage />,
      },
      {
        path: "governance",
        element: <StakingPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
