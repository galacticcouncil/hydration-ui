import { etherscan } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { isEthereumSigner } from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { CallType } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useClaimTxOptions } from "@/modules/xcm/history/hooks/useClaimTxOptions"
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

  const chain = resolveChainFromUrn(journey.destination)
  const chainName = chain?.name ?? ""

  const asset = getTransferAsset(journey)

  const value = asset ? toDecimal(asset.amount, asset.decimals) : ""
  const symbol = asset?.symbol ?? ""

  const getClaimTxOptions = useClaimTxOptions({ value, symbol, chainName })

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

      // ss58 origin — the claim is an EVM.call extrinsic on the destination
      // parachain itself, no remote xcm hop involved.
      if (result.type === CallType.Substrate) {
        const { call, chain: destChain } = result

        const tx = await papi.txFromCallData(Binary.fromHex(call.data))

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

      // H160 origin — hydration is a first-class evm destination now, so the
      // transceiver call is signed directly instead of being wrapped.
      if (result.type === CallType.Evm) {
        const { call, chain: destChain } = result
        const signer = getWallet(account.provider)?.signer

        if (!isEthereumSigner(signer)) {
          throw new Error("Ethereum signer is required to claim")
        }

        const options = getClaimTxOptions(destChain, result.type, {
          createLink: (txHash) => etherscan.tx(destChain.key, txHash),
          onSubmitted: () => {
            setIsWaitingForSignature(false)
            addPendingCorrelationId(journey.correlationId)
          },
          onError: () => removePendingCorrelationId(journey.correlationId),
        })

        return signer.signAndSubmit(
          { data: call.data, to: call.to, value: call.value },
          options,
        )
      }

      throw new Error("Unsupported claim transaction type")
    },
  })

  const isPending = mutation.isPending || isWaitingForSignature

  return { ...mutation, isPending }
}
