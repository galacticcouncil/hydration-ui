import { Button, type ButtonSize, Flex } from "@galacticcouncil/ui/components"
import {
  type MultisigAccount,
  type MultisigPendingTx,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDecodedMultisigTx } from "@/api/multisig"
import {
  getHasApproved,
  getIsDepositor,
  getIsSignatory,
  getMultisigAddress,
  getNormalizedApprovals,
  getSignatoryAddresses,
  useApproveMultisigMutation,
  useRejectMultisigMutation,
} from "@/modules/transactions/review/ReviewMultisig/ReviewMultisig.utils"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useRpcProvider } from "@/providers/rpcProvider"

type ReviewMultisigActionProps = {
  tx: MultisigPendingTx
  multisig: MultisigAccount
  size?: ButtonSize
}

export const ReviewMultisigAction: FC<ReviewMultisigActionProps> = ({
  tx,
  multisig,
  size = "large",
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  const { data: decodedTx, isLoading: isDecodingTx } = useDecodedMultisigTx(tx)

  const multisigAddress = getMultisigAddress(multisig)
  const proposalTx = isPapiTransaction(decodedTx?.tx) ? decodedTx.tx : null

  const callerAddress = account?.isMultisig
    ? account.multisigSignerAddress
    : account?.address

  const normalizedApprovals = useMemo(() => getNormalizedApprovals(tx), [tx])
  const signatoryAddresses = useMemo(
    () => getSignatoryAddresses(multisig),
    [multisig],
  )

  const hasApproved = getHasApproved(account, normalizedApprovals)
  const isSignatory = getIsSignatory(callerAddress, signatoryAddresses)
  const isDepositor = getIsDepositor(callerAddress, tx)

  const approvedCount = normalizedApprovals.length
  const threshold = multisig.threshold ?? multisig.signatories.length
  const isFinalApproval = approvedCount + 1 >= threshold

  const isProxyMultisig =
    multisig.delegateeFor.length > 0 || multisig.delegatorFor.length > 0

  const proposalTxMissing = !isDecodingTx && !proposalTx
  const hideApproveForMissingDecoded = isFinalApproval && proposalTxMissing

  const showApprove =
    !!account &&
    isSignatory &&
    !hasApproved &&
    !isProxyMultisig &&
    !hideApproveForMissingDecoded
  const showReject =
    !!account && isSignatory && hasApproved && isDepositor && !isProxyMultisig

  const approveMutation = useApproveMultisigMutation({
    callerAddress,
    isFinalApproval,
    multisig,
    multisigAddress,
    papi,
    proposalTx,
    tx,
  })

  const rejectMutation = useRejectMultisigMutation({
    callerAddress,
    multisig,
    papi,
    tx,
  })

  const approveDisabled =
    !callerAddress ||
    !isSignatory ||
    (isFinalApproval && (isDecodingTx || !proposalTx)) ||
    approveMutation.isPending
  const rejectDisabled =
    !callerAddress || !isSignatory || rejectMutation.isPending

  return (
    <Flex gap="s">
      {showApprove && (
        <Button
          size={size}
          variant="primary"
          disabled={approveDisabled}
          onClick={() => approveMutation.mutate()}
        >
          {isFinalApproval
            ? t("multisig.modal.approveAndExecute")
            : t("multisig.modal.approve")}
        </Button>
      )}
      {showReject && (
        <Button
          size={size}
          variant="danger"
          outline
          disabled={rejectDisabled}
          onClick={() => rejectMutation.mutate()}
        >
          {t("multisig.modal.reject")}
        </Button>
      )}
    </Flex>
  )
}
