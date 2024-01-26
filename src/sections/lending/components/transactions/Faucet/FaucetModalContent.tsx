import { mintAmountsPerToken, valueToWei } from "@aave/contract-helpers"
import { normalize } from "@aave/math-utils"
import { Trans } from "@lingui/macro"
import { useModalContext } from "sections/lending/hooks/useModal"

import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { FaucetActions } from "./FaucetActions"

export type FaucetModalContentProps = {
  underlyingAsset: string
}

export enum ErrorType {}

export const FaucetModalContent = ({
  poolReserve,
  isWrongNetwork,
}: ModalWrapperProps) => {
  const { gasLimit, mainTxState: faucetTxState, txError } = useModalContext()
  const defaultValue = valueToWei("1000", 18)
  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    ? mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    : defaultValue
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals)

  if (faucetTxState.success)
    return (
      <TxSuccessView
        action={<span>Received</span>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    )

  return (
    <>
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<span>Amount</span>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <FaucetActions
        poolReserve={poolReserve}
        isWrongNetwork={isWrongNetwork}
        blocked={false}
      />
    </>
  )
}
