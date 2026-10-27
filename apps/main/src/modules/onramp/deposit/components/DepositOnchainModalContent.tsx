import { FC } from "react"

import { DepositOnchain } from "@/modules/onramp/deposit/DepositOnchain"
import { DepositPreview } from "@/modules/onramp/deposit/preview/DepositPreview"
import { DepositFlow } from "@/modules/onramp/store/useOnrampModal"

import { DepositFlowLayout } from "./DepositFlowLayout"

type DepositOnchainModalContentProps = { flow: DepositFlow }

export const DepositOnchainModalContent: FC<
  DepositOnchainModalContentProps
> = ({ flow }) => (
  <DepositFlowLayout flow={flow}>
    {flow === "current" || flow === "connected" ? (
      <DepositOnchain key={flow} />
    ) : (
      <DepositPreview variant={flow} />
    )}
  </DepositFlowLayout>
)
