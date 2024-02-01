import { Navigate } from "@tanstack/react-location"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"
const isXYKPageEnabled = import.meta.env.VITE_FF_XYK_ENABLED === "true"

export const routes = [
  {
    path: "/",
    element: <Navigate to="/trade/swap" />,
  },
  {
    path: "trade",
    element: () =>
      import("sections/trade/TradePage").then((mod) => <mod.TradePage />),
    children: [
      {
        path: "/",
        element: <Navigate to="swap" />,
      },
      {
        path: "swap",
        element: () =>
          import("sections/trade/sections/swap/SwapPage").then((mod) => (
            <mod.SwapPage />
          )),
      },
      {
        ...(isOtcPageEnabled && {
          path: "otc",
          element: () =>
            import("sections/trade/sections/otc/OtcPageWrappet").then((mod) => (
              <mod.OtcPageWrapper />
            )),
        }),
      },
      {
        path: "yield-dca",
        element: () =>
          import("sections/trade/sections/yieldDca/YieldDcaPage").then(
            (mod) => <mod.YieldDcaPage />,
          ),
      },
      {
        ...(isDcaPageEnabled && {
          path: "dca",
          element: () =>
            import("sections/trade/sections/dca/DcaPage").then((mod) => (
              <mod.DcaPage />
            )),
        }),
      },
      ...(isBondsPageEnabled
        ? [
            {
              path: "bond",
              element: () =>
                import(
                  "sections/trade/sections/bonds/details/BondDetailsPage"
                ).then((mod) => <mod.BondDetailsPage />),
            },
          ]
        : []),
      ...(isBondsPageEnabled
        ? [
            {
              path: "bonds",
              element: () =>
                import("sections/trade/sections/bonds/BondsPageWrapper").then(
                  (mod) => <mod.BondsPageWrapper />,
                ),
            },
          ]
        : []),
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
        element: () =>
          import("sections/wallet/WalletPage").then((mod) => (
            <mod.WalletPage />
          )),
      },
      {
        path: "vesting",
        element: () =>
          import("sections/wallet/WalletPage").then((mod) => (
            <mod.WalletPage />
          )),
      },
    ],
  },
  {
    path: "liquidity",
    element: () =>
      import("sections/pools/PoolsPage").then((mod) => <mod.PoolsPage />),
    children: [
      {
        path: "/",
        element: <Navigate to="all-pools" />,
      },
      {
        path: "my-liquidity",
        element: () =>
          import("sections/pools/sections/MyLiquidity").then((mod) => (
            <mod.MyLiquidity />
          )),
      },
      {
        path: "all-pools",
        element: () =>
          import("sections/pools/sections/AllPools").then((mod) => (
            <mod.AllPools />
          )),
      },
      {
        path: "omnipool-stablepools",
        element: () =>
          import("sections/pools/sections/OmnipoolAndStablepool").then(
            (mod) => <mod.OmnipoolAndStablepool />,
          ),
      },
      ...(isXYKPageEnabled
        ? [
            {
              path: "isolated",
              element: () =>
                import("sections/pools/sections/IsolatedPools").then((mod) => (
                  <mod.IsolatedPools />
                )),
            },
          ]
        : []),
    ],
  },
  {
    path: "cross-chain",
    element: () =>
      import("sections/xcm/XcmPage").then((mod) => <mod.XcmPage />),
  },
  {
    path: "bridge",
    element: () =>
      import("sections/xcm/BridgePage").then((mod) => <mod.BridgePage />),
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
        element: () =>
          import("sections/stats/sections/overview/StatsOverview").then(
            (mod) => <mod.StatsOverview />,
          ),
      },
      {
        path: "treasury",
        element: () =>
          import("sections/stats/sections/POL/StatsPOL").then((mod) => (
            <mod.StatsPOL />
          )),
      },
      {
        path: "asset",
        element: () =>
          import(
            "sections/stats/sections/omnipoolAsset/StatsOmnipoolAsset"
          ).then((mod) => <mod.StatsOmnipoolAsset />),
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
    element: () =>
      import("sections/staking/StakingPage").then((mod) => <mod.StakingPage />),
  },
  {
    path: "referrals",
    element: () =>
      import("sections/referrals/ReferralsPage").then((mod) => (
        <mod.ReferralsWrapper />
      )),
  },
  {
    path: "*",
    element: <Navigate to="/trade" />,
  },
]
