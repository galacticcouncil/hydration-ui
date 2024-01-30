import { PERMISSION } from "@aave/contract-helpers"

import React, { useState } from "react"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { getGhoReserve } from "sections/lending/utils/ghoUtilities"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { WithdrawAndSwitchModalContent } from "./WithdrawAndSwitchModalContent"
import { WithdrawModalContent } from "./WithdrawModalContent"
import { WithdrawType, WithdrawTypeSelector } from "./WithdrawTypeSelector"

export const WithdrawModal = () => {
  const { type, close, args, mainTxState } =
    useModalContext() as ModalContextType<{
      underlyingAsset: string
    }>
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true)
  const [withdrawType, setWithdrawType] = useState(WithdrawType.WITHDRAW)
  const { currentMarketData } = useProtocolDataContext()
  const { reserves } = useAppDataContext()

  const ghoReserve = getGhoReserve(reserves)

  const isWithdrawAndSwapPossible =
    isFeatureEnabled.withdrawAndSwitch(currentMarketData) &&
    args.underlyingAsset !== ghoReserve?.underlyingAsset

  const handleClose = () => {
    setWithdrawType(WithdrawType.WITHDRAW)
    close()
  }

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={handleClose}>
      <ModalWrapper
        title={<span>Withdraw</span>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <>
            {isWithdrawAndSwapPossible && !mainTxState.txHash && (
              <WithdrawTypeSelector
                withdrawType={withdrawType}
                setWithdrawType={setWithdrawType}
              />
            )}
            {withdrawType === WithdrawType.WITHDRAW && (
              <WithdrawModalContent
                {...params}
                unwrap={withdrawUnWrapped}
                setUnwrap={setWithdrawUnWrapped}
              />
            )}
            {withdrawType === WithdrawType.WITHDRAWSWITCH && (
              <>
                <WithdrawAndSwitchModalContent {...params} />
              </>
            )}
          </>
        )}
      </ModalWrapper>
    </BasicModal>
  )
}
