import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useMatch } from "@tanstack/react-router"
import React from "react"

export const HeaderWeb3ConnectButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Web3ConnectButton>
> = (props) => {
  const isCrossChainPage = !!useMatch({
    from: "/cross-chain/",
    shouldThrow: false,
  })
  return (
    <Web3ConnectButton
      {...props}
      size="large"
      variant="secondary"
      allowIncompatibleAccounts={isCrossChainPage}
      sx={{ height: 40 }}
    />
  )
}
