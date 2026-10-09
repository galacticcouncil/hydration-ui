import {
  Account,
  WalletMode,
  Web3ConnectModal,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import { ConnectTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import {
  RecipientConnectTile,
  RecipientModal,
} from "@/modules/xcm/transfer/components/Recipient"
import { useRpcProvider } from "@/providers/rpcProvider"

// Wallets that can receive on each destination; a destination not listed
// takes only a pasted or saved address
const DEST_WALLET_MODES: Partial<Record<XcSwapPlatform, WalletMode>> = {
  near: WalletMode.Near,
  zec: WalletMode.Zcash,
}

type XcSwapRecipientButtonProps = {
  destChain: XcChain
}

export const XcSwapRecipientButton: React.FC<XcSwapRecipientButtonProps> = ({
  destChain,
}) => {
  const { t } = useTranslation("xcm")
  const { papi } = useRpcProvider()
  const { watch, setValue } = useFormContext<XcSwapFormValues>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [connectedAccount, setConnectedAccount] = useState<Account | null>(null)

  const destAddress = watch("destAddress").trim()

  const walletMode = DEST_WALLET_MODES[destChain.platform] ?? null

  // The connected account, while the swap still pays out to it
  const destAccount =
    connectedAccount?.rawAddress === destAddress ? connectedAccount : null
  const destWallet = destAccount ? getWallet(destAccount.provider) : null

  const selectAddress = (address: string, account: Account | null = null) => {
    setConnectedAccount(account)
    setValue("destAddress", address, { shouldValidate: true })
    setIsModalOpen(false)
  }

  return (
    <>
      <ConnectButton
        walletProvider={destAccount?.provider}
        placeholder={t("recipient.button.selectRecipient")}
        address={destAddress}
        onClick={() => setIsModalOpen(true)}
      />
      <RecipientModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        destinationWallet={
          walletMode &&
          (destAccount ? (
            <RecipientConnectTile
              account={destAccount}
              walletLogoSrc={destWallet?.logo}
              onSelect={() => setIsModalOpen(false)}
              onConnect={() => setIsConnectModalOpen(true)}
            />
          ) : (
            <ConnectTile
              chainName={destChain.name}
              logo={<XcLogo src={destChain.logo} size="large" />}
              onConnect={() => setIsConnectModalOpen(true)}
            />
          ))
        }
        customAddress={{
          chainName: destChain.name,
          isValidAddress: (address) =>
            destChain.addressValidator(address.trim()),
        }}
        onSubmitAddress={(address) => selectAddress(address.trim())}
      />
      {walletMode && (
        // Controlled: the account fills the destination and never
        // becomes the app's active account
        <Web3ConnectModal
          neckwork={neckworkClient}
          papi={papi}
          open={isConnectModalOpen}
          mode={walletMode}
          onOpenChange={setIsConnectModalOpen}
          onAccountSelect={(account) => {
            setIsConnectModalOpen(false)
            selectAddress(account.rawAddress, account)
          }}
        />
      )}
    </>
  )
}
