import { WalletPage } from "./sections/wallet/WalletPage"

import { Navigate } from "@tanstack/react-location"
import { TradePage } from "sections/gcapps/trade/TradePage"
import { XcmPage } from "sections/gcapps/xcm/XcmPage"

import { PoolsPage } from "sections/pools/PoolsPage"

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
        path: "transactions",
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
]
