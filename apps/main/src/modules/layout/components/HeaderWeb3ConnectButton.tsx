import { pxToRem } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useMatch } from "@tanstack/react-router"
import React from "react"

import { UserMenu } from "@/modules/layout/components/UserMenu"
import { SSplitContainer } from "@/modules/layout/components/UserMenu/UserMenu.styled"
import { useRecentProviderAccountSync } from "@/states/recentProviderAccounts"

export const HeaderWeb3ConnectButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Web3ConnectButton>
> = (props) => {
  useRecentProviderAccountSync()

  const isCrossChainPage = !!useMatch({
    from: "/cross-chain/",
    shouldThrow: false,
  })
  const { account } = useAccount()
  const showUserMenu =
    !!account && (isCrossChainPage || !account.isIncompatible)

  const button = (
    <Web3ConnectButton
      {...props}
      size="large"
      variant="secondary"
      allowIncompatibleAccounts={isCrossChainPage}
      sx={{ height: pxToRem(36) }}
      hideCaret={showUserMenu}
    />
  )

  if (!showUserMenu) return button

  return (
    <SSplitContainer>
      {button}
      <UserMenu />
    </SSplitContainer>
  )
}
