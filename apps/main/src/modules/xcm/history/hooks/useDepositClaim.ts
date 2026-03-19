import { HYDRATION_CHAIN_KEY, isAnyParachain } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { CallType } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useCrossChainWallet } from "@/api/xcm"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import {
  buildClaimCall,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"
import { useRpcProvider } from "@/providers/rpcProvider"
import { TransactionType, useTransactionsStore } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export function useDepositClaim(journey: XcJourney) {
  const { t } = useTranslation("common")
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false)
  const { addPendingCorrelationId, removePendingCorrelationId } =
    usePendingClaimsStore()
  const { papi } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const wallet = useCrossChainWallet()
  const { data: feePaymentAssetId } = useAccountFeePaymentAssetId()

  const chain = resolveChainFromUrn(journey.destination)
  const chainName = chain?.name ?? ""

  const asset = getTransferAsset(journey)

  const value = asset ? toDecimal(asset.amount, asset.decimals) : ""
  const symbol = asset?.symbol ?? ""

  const mutation = useMutation({
    onMutate: () => {
      setIsWaitingForSignature(true)
    },
    onSettled: () => {
      setIsWaitingForSignature(false)
    },
    mutationFn: async (account: Account) => {
      const result = await buildClaimCall(journey, account.rawAddress)

      if (!result) {
        throw new Error("Failed to build claim call")
      }

      if (result.type === CallType.Substrate) {
        const { call, chain: destChain } = result

        const srcChain = chainsMap.get(HYDRATION_CHAIN_KEY)
        const claimChain = chainsMap.get("moonbeam")

        if (
          !srcChain ||
          !claimChain ||
          !isAnyParachain(srcChain) ||
          !isAnyParachain(claimChain)
        ) {
          throw new Error("Invalid chains for substrate claim")
        }

        const feeAsset = feePaymentAssetId
          ? srcChain.findAssetById(String(feePaymentAssetId))
          : undefined

        const remoteTx = await wallet.remoteXcm(
          account.address,
          srcChain,
          claimChain,
          call,
          { srcFeeAsset: feeAsset?.asset },
        )

        const tx = await papi.txFromCallData(Binary.fromHex(remoteTx.data))

        return createTransaction(
          {
            tx,
            toasts: {
              submitted: t("claim.toast.submitted", {
                value,
                symbol,
                chainName,
              }),
              success: t("claim.toast.success", {
                value,
                symbol,
                chainName,
              }),
            },
            meta: {
              type: TransactionType.Onchain,
              srcChainKey: destChain.key,
            },
          },
          {
            onSubmitted: () => {
              setIsWaitingForSignature(false)
              addPendingCorrelationId(journey.correlationId)
            },
            onError: () => removePendingCorrelationId(journey.correlationId),
          },
        )
      }

      throw new Error("Unsupported claim transaction type")
    },
  })

  const isPending = mutation.isPending || isWaitingForSignature

  return { ...mutation, isPending }
}
