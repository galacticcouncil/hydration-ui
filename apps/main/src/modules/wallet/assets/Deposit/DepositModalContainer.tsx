import { FC, useState } from "react"

import { DepositModal } from "@/modules/wallet/assets/Deposit/DepositModal"
import { HowToDepositModal } from "@/modules/wallet/assets/Deposit/HowToDeposit"

type ModalStage = "overview" | "centralized" | "onChain" | "crypto"

export const DepositModalContainer: FC = () => {
  const [stage, setStage] = useState<ModalStage | null>("overview")

  switch (stage) {
    case "overview":
      return (
        <DepositModal
          onCentralizedClick={() => setStage("centralized")}
          onOnChainClick={() => setStage("onChain")}
          onCryptoClick={() => setStage("crypto")}
        />
      )
    case "centralized":
      return <HowToDepositModal onBack={() => setStage("overview")} />
    case "onChain":
      return null
    case "crypto":
      return null
  }
}
