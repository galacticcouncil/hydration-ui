import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  type Account,
  type MultisigAccount,
  type MultisigPendingTx,
} from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  buildApproveAsMulti,
  buildAsMulti,
  buildCancelAsMulti,
  extractMultisigProposalCallFromTx,
  getDecodedProposalTx,
} from "@/api/multisig"
import type { AnyPapiTx } from "@/modules/transactions/types"
import type { Papi } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const getMultisigAddress = (multisig: MultisigAccount) =>
  safeConvertPublicKeyToSS58(multisig.pubKey)

export const getNormalizedApprovals = (tx: MultisigPendingTx) =>
  tx.approvals.map((approval) => safeConvertAddressSS58(approval))

export const getSignatoryAddresses = (multisig: MultisigAccount) =>
  multisig.signatories.map((signatory) =>
    safeConvertPublicKeyToSS58(signatory.signatory.pubKey),
  )

export const getHasApproved = (
  account: Account | null,
  normalizedApprovals: string[],
) => {
  const connectedNormalized = account
    ? safeConvertAddressSS58(account.address)
    : ""

  const hasApprovedAsMultisig =
    !!account?.isMultisig &&
    !!account?.multisigSignerAddress &&
    normalizedApprovals.includes(account.multisigSignerAddress)

  const hasApprovedAsConnected = connectedNormalized
    ? normalizedApprovals.includes(connectedNormalized)
    : false

  return hasApprovedAsMultisig || hasApprovedAsConnected
}

export const getIsSignatory = (
  callerAddress: string | undefined,
  signatoryAddresses: string[],
) => !!callerAddress && signatoryAddresses.includes(callerAddress)

export const getIsDepositor = (
  callerAddress: string | undefined,
  tx: MultisigPendingTx,
) =>
  !!callerAddress &&
  stringEquals(callerAddress, safeConvertAddressSS58(tx.depositor))

export const getCandidateApproveTx = ({
  isSignatory,
  callerAddress,
  papi,
  multisig,
  tx,
}: {
  isSignatory: boolean
  callerAddress: string | undefined
  papi: Papi
  multisig: MultisigAccount
  tx: MultisigPendingTx
}) => {
  if (!isSignatory || !callerAddress) return null

  try {
    return buildApproveAsMulti(papi, callerAddress, multisig, tx)
  } catch {
    return null
  }
}

export const useApproveMultisigMutation = ({
  callerAddress,
  isFinalApproval,
  multisig,
  multisigAddress,
  papi,
  proposalTx,
  tx,
}: {
  callerAddress: string | undefined
  isFinalApproval: boolean
  multisig: MultisigAccount
  multisigAddress: string
  papi: Papi
  proposalTx: AnyPapiTx | null
  tx: MultisigPendingTx
}) => {
  const { t } = useTranslation()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!callerAddress) return

      const papiTx = (async () => {
        if (isFinalApproval && proposalTx) {
          const call = extractMultisigProposalCallFromTx(proposalTx)
          if (!call) {
            throw new Error("Unable to decode multisig proposal call")
          }
          const decodedTx = await getDecodedProposalTx(papi, call)
          const { weight } = await decodedTx.getPaymentInfo(multisigAddress)

          return buildAsMulti(
            papi,
            callerAddress,
            multisig,
            call,
            weight,
            tx.when,
          )
        }

        return buildApproveAsMulti(papi, callerAddress, multisig, tx)
      })()

      await createTransaction({
        tx: await papiTx,
        toasts: {
          submitted: t("multisig.tx.approve.loading"),
          success: t("multisig.tx.approve.success"),
          error: t("multisig.tx.approve.error"),
        },
      })
    },
  })
}

export const useRejectMultisigMutation = ({
  callerAddress,
  multisig,
  papi,
  tx,
}: {
  callerAddress: string | undefined
  multisig: MultisigAccount
  papi: Papi
  tx: MultisigPendingTx
}) => {
  const { t } = useTranslation()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!callerAddress) return

      const papiTx = buildCancelAsMulti(papi, callerAddress, multisig, tx)

      await createTransaction({
        tx: papiTx,
        toasts: {
          submitted: t("multisig.tx.reject.loading"),
          success: t("multisig.tx.reject.success"),
          error: t("multisig.tx.reject.error"),
        },
      })
    },
  })
}
