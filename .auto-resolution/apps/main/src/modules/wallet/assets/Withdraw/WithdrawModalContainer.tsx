import { FC, useState } from "react"

import { WithdrawModal } from "@/modules/wallet/assets/Withdraw/WithdrawModal"
import { WithdrawOnChainModalContainer } from "@/modules/wallet/assets/Withdraw/WithdrawOnChainModalContainer"

type ModalStage = "overview" | "centralized" | "onChain"

export const WithdrawModalContainer: FC = () => {
  const [stage, setStage] = useState<ModalStage | null>("overview")

  switch (stage) {
    case "overview":
      return (
        <WithdrawModal
          onCentralizedClick={() => setStage("centralized")}
          onOnChainClick={() => setStage("onChain")}
        />
      )
    case "centralized":
      return null
    case "onChain":
      return (
        <WithdrawOnChainModalContainer onBack={() => setStage("overview")} />
      )
  }
}
