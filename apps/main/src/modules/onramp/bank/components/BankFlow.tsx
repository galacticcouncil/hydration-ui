import { useAccount, useWallet } from "@galacticcouncil/web3-connect"
import { FC } from "react"

import { BankConnectEvm } from "@/modules/onramp/bank/components/BankConnectEvm"
import { BankOnboarding } from "@/modules/onramp/bank/components/BankOnboarding"
import { BankSignIn } from "@/modules/onramp/bank/components/BankSignIn"
import {
  BankDirection,
  MessageSigner,
  useHbrSession,
} from "@/modules/onramp/bank/hooks/useHbr"
import { getBankWalletGate } from "@/modules/onramp/bank/utils/walletGate"

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
 * The bank deposit and cash-out set-up, shared by /deposit and /withdraw:
 * EVM wallet gate, sign-in, then onboarding (API doc section 2).
 */
type BankFlowProps = {
  direction: BankDirection
}

export const BankFlow: FC<BankFlowProps> = ({ direction }) => {
  const { account } = useAccount()
  const wallet = useWallet()
  const gate = getBankWalletGate(account, wallet?.signer)

  if (!gate.ok) return <BankConnectEvm reason={gate.reason} />
  return (
    <BankSession
      key={gate.h160}
      h160={gate.h160}
      signer={gate.signer}
      direction={direction}
    />
  )
}
