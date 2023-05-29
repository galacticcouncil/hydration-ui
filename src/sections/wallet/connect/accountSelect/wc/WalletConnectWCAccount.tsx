import { Account } from "state/store"
import { HDX_CAIP_ID, useWalletConnect } from "utils/walletConnect"
import { WalletConnectAccountSelectItem } from "../item/WalletConnectAccountSelectItem"

type Props = {
  currentAddress: string | undefined
  onSelect: (account: Account) => void
}

export const WalletConnectWCAccount = ({ currentAddress, onSelect }: Props) => {
  const wc = useWalletConnect()
  const addresses = wc.accounts
    .filter((a) => a.split(":")[1] === HDX_CAIP_ID)
    .map((a) => a.split(":")[2])

  console.log(wc.addresses)

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
