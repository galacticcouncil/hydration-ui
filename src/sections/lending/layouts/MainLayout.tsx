import { Box } from "@mui/material"
import { ReactNode } from "react"
import { decodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"

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
          fontFamily: "monospace",
        }}
      >
        Name: {account?.name ?? ""}
        <br />
        Address: {account?.displayAddress ?? ""}
        <br />
        Pubkey:{" "}
        {account?.address ? u8aToHex(decodeAddress(account?.address)) : ""}
        <br />
        EVM: {evmAccount?.address ?? ""}
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
