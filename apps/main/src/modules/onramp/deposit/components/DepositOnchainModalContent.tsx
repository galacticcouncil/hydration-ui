import { FC } from "react"

import { DepositOnchain } from "@/modules/onramp/deposit/DepositOnchain"
import { DepositPreview } from "@/modules/onramp/deposit/preview/DepositPreview"
import {
  DepositFlow,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"

import { DepositFlowLayout } from "./DepositFlowLayout"

type DepositOnchainModalContentProps = { flow: DepositFlow }

export const DepositOnchainModalContent: FC<
  DepositOnchainModalContentProps
> = ({ flow }) => {
  const entryChoice = useOnrampModal((state) => state.depositEntryChoice)
  const formKey = `${flow}:${entryChoice ? "choice" : "standard"}`
  return (
    <DepositFlowLayout flow={flow}>
      {flow === "current" || flow === "connected" ? (
        <DepositOnchain key={formKey} />
      ) : (
        <DepositPreview key={formKey} variant={flow} />
      )}
    </DepositFlowLayout>
  )
}
