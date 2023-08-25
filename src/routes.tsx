import { WalletPage } from "./sections/wallet/WalletPage"
import { Navigate } from "@tanstack/react-location"
import { XcmPage } from "sections/xcm/XcmPage"
import { PoolsPage } from "sections/pools/PoolsPage"
import { StatsPage } from "sections/stats/StatsPage"
import { StakingPage } from "./sections/staking/StakingPage"
import { TradePage } from "sections/trade/TradePage"

export const routes = [
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
        element: <TradePage />,
      },
      {
        path: "otc",
        element: <TradePage />,
      },
      {
        path: "dca",
        element: <TradePage />,
      },
      {
        path: "bonds",
        element: <TradePage />,
      },
    ],
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
    element: <StakingPage />,
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
