import { PoolsPage } from "./sections/pools/PoolsPage"
import { WalletPage } from "./sections/wallet/WalletPage"
import { Navigate } from "@tanstack/react-location"

export const routes = [
  {
    path: "/",
    element: <Navigate to="/pools-and-farms" />,
  },
  { path: "pools-and-farms", element: <PoolsPage /> },
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
]
