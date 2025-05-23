import { ProtocolAction } from "@aave/contract-helpers"
import { useMemo } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { EmodeCategory } from "@/helpers/types"
import { useTransactionHandler } from "@/helpers/useTransactionHandler"
import { useRootStore } from "@/store/root"

import { getAction, getEmodeMessage } from "./emode.utils"

export type EmodeActionsProps = {
  isWrongNetwork: boolean
  blocked: boolean
  selectedEmode: number
  activeEmode: number
  eModes: Record<number, EmodeCategory>
}

export const EmodeActions = ({
  isWrongNetwork,
  blocked,
  selectedEmode,
  activeEmode,
  eModes,
}: EmodeActionsProps) => {
  const setUserEMode = useRootStore((state) => state.setUserEMode)

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return setUserEMode(selectedEmode)
      },
      skip: blocked,
      deps: [selectedEmode],
      protocolAction: ProtocolAction.setEModeUsage,
      eventTxInfo: {
        previousState: getEmodeMessage(eModes[activeEmode].label),
        newState: getEmodeMessage(eModes[selectedEmode].label),
      },
    })

  const getActionData = useMemo(
    () => getAction(selectedEmode, activeEmode),
    [selectedEmode, activeEmode],
  )

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={async () => {
        /* const name = getActionData({
          enable: eModes[selectedEmode].label,
          disable: eModes[activeEmode].label,
          switch: eModes[selectedEmode].label,
        })

        const key = getActionData({
          enable: "lending.emode.enable.toast",
          disable: "lending.emode.disable.toast",
          switch: "lending.emode.switch.toast",
        })
 */
        await action()
      }}
      actionText={getActionData({
        enable: "Enable E-Mode",
        disable: "Disable E-Mode",
        switch: "Switch E-Mode",
      })}
      actionInProgressText={getActionData({
        enable: "Enabling E-Mode",
        disable: "Disabling E-Mode",
        switch: "Switching E-Mode",
      })}
      isWrongNetwork={isWrongNetwork}
    />
  )
}
