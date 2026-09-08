import { pxToRem } from "@galacticcouncil/ui/utils"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"
import React from "react"

import { TutorialAnchor } from "@/tutorials/TutorialAnchor"

export const HeaderWeb3ConnectButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Web3ConnectButton>
> = (props) => (
  <TutorialAnchor tutorial="intro" step={2} asChild>
    <Web3ConnectButton
      {...props}
      size="large"
      variant="secondary"
      allowIncompatibleAccounts
      sx={{ height: pxToRem(36) }}
    />
  </TutorialAnchor>
)
