import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"

import { AccountSelectModal } from "@/modules/wallet/assets/Withdraw/on-chain/AccountSelectModal"
import { useAssetWithdraForm } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"
import { AssetWithdrawModal } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawModal"
import { OnChainWithdrawModal } from "@/modules/wallet/assets/Withdraw/on-chain/OnChainWithdrawModal"

type Stage = "onChain" | "withdraw" | "selectAccount"

type Props = {
  readonly onBack: () => void
}

export const WithdrawOnChainModalContainer: FC<Props> = ({ onBack }) => {
  const [stage, setStage] = useState<Stage>("onChain")
  const form = useAssetWithdraForm()

  return (
    <FormProvider {...form}>
      {(() => {
        switch (stage) {
          case "onChain":
            return (
              <OnChainWithdrawModal
                onBack={onBack}
                onSelect={() => setStage("withdraw")}
              />
            )
          case "withdraw":
            return (
              <AssetWithdrawModal
                onBack={() => setStage("onChain")}
                onAccountSelect={() => setStage("selectAccount")}
              />
            )

          case "selectAccount":
            return <AccountSelectModal onBack={() => setStage("withdraw")} />
        }
      })()}
    </FormProvider>
  )
}
