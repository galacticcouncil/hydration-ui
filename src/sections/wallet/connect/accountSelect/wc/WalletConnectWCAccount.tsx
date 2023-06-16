import { useCallback, useEffect, useState } from "react"
import { Account } from "state/store"
import { WalletConnectAccountSelectItem } from "../item/WalletConnectAccountSelectItem"
import { useWalletConnect } from "components/OnboardProvider/OnboardProvider"

type Props = {
  currentAddress: string | undefined
  onSelect: (account: Account) => void
}

export const WalletConnectWCAccount = ({ currentAddress, onSelect }: Props) => {
  const { wallet } = useWalletConnect()

  const [addresses, setAddresses] = useState<string[]>([])

  const getAddresses = useCallback(async () => {
    const accounts = await wallet?.getAccounts()
    setAddresses(accounts?.map((a) => a.address) ?? [])
  }, [wallet])

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
