import { WalletPage } from "./sections/wallet/WalletPage"

import { Navigate } from "@tanstack/react-location"
import { TradePage } from "sections/gcapps/trade/TradePage"
import { XcmPage } from "sections/gcapps/xcm/XcmPage"

import { PoolsPage } from "sections/pools/PoolsPage"
import { OtcPage } from "sections/otc/OtcPage"

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
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
