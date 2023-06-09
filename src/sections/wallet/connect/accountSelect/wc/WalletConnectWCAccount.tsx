import { WalletType } from "@polkadot-onboard/core"
import { useWallets } from "@polkadot-onboard/react"
import { useCallback, useEffect, useState } from "react"
import { Account } from "state/store"
import { WalletConnectAccountSelectItem } from "../item/WalletConnectAccountSelectItem"

type Props = {
  currentAddress: string | undefined
  onSelect: (account: Account) => void
}

export const WalletConnectWCAccount = ({ currentAddress, onSelect }: Props) => {
  const { wallets } = useWallets()

  const [addresses, setAddresses] = useState<string[]>([])

  const getAddresses = useCallback(async () => {
    const wallet = wallets?.find((w) => w.type === WalletType.WALLET_CONNECT)
    const accounts = await wallet?.getAccounts()
    setAddresses(accounts?.map((a) => a.address) ?? [])
  }, [wallets])

  useEffect(() => {
    getAddresses()
  }, [getAddresses])

  return (
    <>
      {addresses.map((address, i) => (
        <WalletConnectAccountSelectItem
          key={address}
          isActive={currentAddress === address}
          provider="WalletConnect"
          name="WalletConnect"
          address={address}
          onClick={() =>
            onSelect({
              address,
              provider: "WalletConnect",
              name: "WalletConnect",
              isExternalWalletConnected: false,
            })
          }
        />
      ))}
    </>
  )
}
