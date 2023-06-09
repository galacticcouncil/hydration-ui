import { WalletType } from "@polkadot-onboard/core"
import { useWallets } from "@polkadot-onboard/react"
import { useEffect, useState } from "react"
import { Account } from "state/store"
import { WalletConnectAccountSelectItem } from "../item/WalletConnectAccountSelectItem"

type Props = {
  currentAddress: string | undefined
  onSelect: (account: Account) => void
}

export const WalletConnectWCAccount = ({ currentAddress, onSelect }: Props) => {
  const { wallets } = useWallets()
  const wallet = wallets?.find((w) => w.type === WalletType.WALLET_CONNECT)

  const [addresses, setAddresses] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      const accounts = await wallet?.getAccounts()
      console.log("accounts", accounts)
      setAddresses(accounts?.map((a) => a.address) ?? [])
    })()
  }, [wallet])

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
