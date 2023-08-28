import { WalletPage } from "./sections/wallet/WalletPage"
import { Navigate } from "@tanstack/react-location"
import { XcmPage } from "sections/xcm/XcmPage"
import { PoolsPage } from "sections/pools/PoolsPage"
import { StatsPage } from "sections/stats/StatsPage"
import { StakingPage } from "./sections/staking/StakingPage"
import { TradePage } from "sections/trade/TradePage"
import { SwapPage } from "sections/trade/sections/swap/SwapPage"
import { OtcPageWrapper } from "sections/trade/sections/otc/OtcPageWrappet"
import { DcaApp } from "sections/trade/sections/dca/DcaPage"
import { BondsPageWrapper } from "sections/trade/sections/bonds/BondsPageWrapper"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

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
        element: <SwapPage />,
      },
      {
        ...(isOtcPageEnabled && {
          path: "otc",
          element: <OtcPageWrapper />,
        }),
      },
      {
        ...(isDcaPageEnabled && {
          path: "dca",
          element: <DcaApp />,
        }),
      },

      {
        ...(isBondsPageEnabled && {
          path: "bonds",
          element: <BondsPageWrapper />,
        }),
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
