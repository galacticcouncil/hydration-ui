import { ProtocolAction } from "@aave/contract-helpers"
import { EmodeCategory } from "sections/lending/helpers/types"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { useRootStore } from "sections/lending/store/root"

import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"
import { getEmodeMessage } from "./EmodeNaming"
import { useTranslation } from "react-i18next"
import { createToastMessages } from "state/toasts"
import { useMemo } from "react"
import { getAction } from "./emode.utils"

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
  const { t } = useTranslation()

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
        const name = getActionData({
          enable: eModes[selectedEmode].label,
          disable: eModes[activeEmode].label,
          switch: eModes[selectedEmode].label,
        })

        const key = getActionData({
          enable: "lending.emode.enable.toast",
          disable: "lending.emode.disable.toast",
          switch: "lending.emode.switch.toast",
        })

        await action(
          createToastMessages(key, {
            t,
            tOptions: { name },
            components: ["span.highlight"],
          }),
        )
      }}
      actionText={
        <span>
          {getActionData({
            enable: "Enable E-Mode",
            disable: "Disable E-Mode",
            switch: "Switch E-Mode",
          })}
        </span>
      }
      actionInProgressText={
        <span>
          {getActionData({
            enable: "Enabling E-Mode",
            disable: "Disabling E-Mode",
            switch: "Switching E-Mode",
          })}
        </span>
      }
      isWrongNetwork={isWrongNetwork}
    />
  )
}
