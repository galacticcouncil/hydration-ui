import { pxToRem } from "@galacticcouncil/ui/utils"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import React from "react"

export const HeaderWeb3ConnectButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Web3ConnectButton>
> = (props) => (
  <Web3ConnectButton
    {...props}
    size="large"
    variant="secondary"
    allowIncompatibleAccounts
    sx={{ height: pxToRem(36) }}
  />
)
