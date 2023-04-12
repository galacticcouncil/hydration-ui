import { WalletPage } from "./sections/wallet/WalletPage"

import { Navigate } from "@tanstack/react-location"
import { TradePage } from "sections/gcapps/trade/TradePage"
import { XcmPage } from "sections/gcapps/xcm/XcmPage"

import { OtcPage } from "sections/otc/OtcPage"
import { PoolsPage } from "sections/pools/PoolsPage"
import { StatsPage } from "sections/stats/StatsPage"

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
    element: <OtcPage />,
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
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
