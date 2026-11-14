import { useAccount, useWallet } from "@galacticcouncil/web3-connect"
import { FC, useEffect, useMemo, useState } from "react"

import { BankConnectEvm } from "@/modules/onramp/bank/components/BankConnectEvm"
import { BankOnboarding } from "@/modules/onramp/bank/components/BankOnboarding"
import { BankSignIn } from "@/modules/onramp/bank/components/BankSignIn"
import { BankFlowContext } from "@/modules/onramp/bank/hooks/useBankFlow"
import {
  BankDirection,
  MessageSigner,
  useHbrSession,
} from "@/modules/onramp/bank/hooks/useHbr"
import { useBankEntryStore } from "@/modules/onramp/bank/store/useBankEntryStore"
import { isBankFlowEnabled } from "@/modules/onramp/bank/utils/bankAvailability"
import { getBankWalletGate } from "@/modules/onramp/bank/utils/walletGate"

// Each mount of BankFlow is one opening of the flow (a user action).
let openCounter = 0

type BankSessionProps = {
  h160: string
  signer: MessageSigner
  direction: BankDirection
}

const BankSession: FC<BankSessionProps> = ({ h160, signer, direction }) => {
  const session = useHbrSession(h160)
  if (!session) return <BankSignIn h160={h160} signer={signer} />
  // `h160` is the connected wallet. Every query below asks for this wallet's
  // token (hbrSessionAccess.getToken), so even a session of another wallet
  // that slipped past the check above sends nothing and shows nothing.
  return <BankOnboarding h160={h160} signer={signer} direction={direction} />
}

/**
 * The bank deposit and cash-out flows, shared by /deposit and /withdraw: EVM
 * wallet gate, sign-in, then onboarding (API doc section 2), as the Figma
 * modal steps. `onExit` is back from the first step; `onClose` is the modal's
 * close (to Portfolio, Deposits). Both are navigation only.
 */
type BankFlowProps = {
  direction: BankDirection
  onExit?: () => void
  onClose?: () => void
}

export const BankFlow: FC<BankFlowProps> = ({ direction, onExit, onClose }) => {
  const { account } = useAccount()
  const wallet = useWallet()
  const gate = getBankWalletGate(account, wallet?.signer)
  // Read once and then cleared: a reopen from Portfolio applies to this mount.
  const [entry] = useState(() => {
    const pending = useBankEntryStore.getState().entry
    return pending?.direction === direction ? pending : null
  })
  useEffect(() => {
    useBankEntryStore.getState().clear()
  }, [])
  const [openId] = useState(() => (openCounter += 1))
  const nav = useMemo(
    () => ({
      direction,
      onExit,
      onClose,
      entry: entry?.target,
      reopened: !!entry,
      openId,
    }),
    [direction, onExit, onClose, entry, openId],
  )

  if (!isBankFlowEnabled()) return null
  return (
    <BankFlowContext.Provider value={nav}>
      {gate.ok ? (
        <BankSession
          key={gate.h160}
          h160={gate.h160}
          signer={gate.signer}
          direction={direction}
        />
      ) : (
        <BankConnectEvm reason={gate.reason} />
      )}
    </BankFlowContext.Provider>
  )
}
