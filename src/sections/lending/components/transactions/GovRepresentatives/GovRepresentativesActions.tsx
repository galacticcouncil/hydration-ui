import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { ZERO_ADDRESS } from "sections/lending/modules/governance/utils/formatProposal"
import { useRootStore } from "sections/lending/store/root"
import {
  getErrorTextFromError,
  TxAction,
} from "sections/lending/ui-config/errorMapping"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import { useSharedDependencies } from "sections/lending/ui-config/SharedDependenciesProvider"

import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"
import { UIRepresentative } from "./GovRepresentativesModalContent"
import { useQueryClient } from "@tanstack/react-query"

export const GovRepresentativesActions = ({
  blocked,
  isWrongNetwork,
  representatives,
}: {
  blocked: boolean
  isWrongNetwork: boolean
  representatives: UIRepresentative[]
}) => {
  const queryClient = useQueryClient()
  const { mainTxState, setMainTxState, setTxError, setGasLimit } =
    useModalContext()
  const { governanceV3Service } = useSharedDependencies()
  const { sendTx } = useWeb3Context()
  const [account, estimateGasLimit, addTransaction] = useRootStore((state) => [
    state.account,
    state.estimateGasLimit,
    state.addTransaction,
  ])

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true })

    try {
      let populatedTx = governanceV3Service.updateRepresentativesForChain(
        account,
        representatives.map((r) => ({
          chainId: r.chainId,
          representative:
            r.representative === "" || r.remove
              ? ZERO_ADDRESS
              : r.representative,
        })),
      )

      populatedTx = await estimateGasLimit(populatedTx)
      const response = await sendTx(populatedTx)
      await response.wait(1)

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      })

      addTransaction(response.hash, {
        action: "change representative",
        txState: "success",
      })

      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.governanceRepresentatives(account),
      })
    } catch (error) {
      const parsedError = getErrorTextFromError(
        error,
        TxAction.GAS_ESTIMATION,
        false,
      )
      setTxError(parsedError)
      setMainTxState({
        txHash: undefined,
        loading: false,
      })
    }
  }

  setGasLimit("100000") // TODO

  return (
    <TxActionsWrapper
      requiresApproval={false}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={false}
      handleAction={action}
      actionText={<span>Confirm transaction</span>}
      actionInProgressText={<span>Confirming transaction</span>}
      isWrongNetwork={isWrongNetwork}
    />
  )
}
