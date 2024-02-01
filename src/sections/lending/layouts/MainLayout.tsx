import { Box } from "@mui/material"
import { ReactNode } from "react"

import { AppHeader } from "./AppHeader"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import {
  useAccount,
  useEvmAccount,
} from "sections/web3-connect/Web3Connect.utils"

export function MainLayout({ children }: { children: ReactNode }) {
  const { account } = useAccount()
  const { account: evmAccount } = useEvmAccount()
  return (
    <LendingPageProviders>
      <AppHeader />
      <Box
        css={{
          textAlign: "right",
          background: "#1B2030",
          color: "white",
          padding: 10,
          fontSize: 14,
        }}
      >
        {account?.name}: {account?.displayAddress} {"->"} {evmAccount?.address}
      </Box>
      <Box
        component="main"
        sx={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        {children}
      </Box>
    </LendingPageProviders>
  )
}
