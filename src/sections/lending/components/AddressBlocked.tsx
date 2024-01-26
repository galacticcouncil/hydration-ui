import { ReactNode } from "react"
import { useAddressAllowed } from "sections/lending/hooks/useAddressAllowed"
import { MainLayout } from "sections/lending/layouts/MainLayout"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { ENABLE_TESTNET } from "sections/lending/utils/marketsAndNetworksConfig"

import { AddressBlockedModal } from "./AddressBlockedModal"

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount, disconnectWallet, readOnlyMode, loading } =
    useWeb3Context()
  const screenAddress =
    readOnlyMode || loading || ENABLE_TESTNET ? "" : currentAccount
  const { isAllowed } = useAddressAllowed(screenAddress)

  if (!isAllowed) {
    return (
      <MainLayout>
        <AddressBlockedModal
          address={currentAccount}
          onDisconnectWallet={disconnectWallet}
        />
        ;
      </MainLayout>
    )
  }

  return <>{children}</>
}
