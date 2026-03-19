import { etherscan, jitoexplorer, solexplorer } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import {
  isEthereumSigner,
  isSolanaSigner,
  isSuiSigner,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { CallType } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import {
  buildClaimCall,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"
import { toDecimal } from "@/utils/formatting"

import { useClaimTxOptions } from "./useClaimTxOptions"

export function useWithdrawClaim(journey: XcJourney) {
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false)
  const { addPendingCorrelationId, removePendingCorrelationId } =
    usePendingClaimsStore()

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
      const wallet = getWallet(account.provider)
      const signer = wallet?.signer

      const result = await buildClaimCall(journey, account.rawAddress)

      if (!result) {
        throw new Error("Failed to build claim call")
      }

      const commonCallbacks = {
        onSubmitted: () => {
          setIsWaitingForSignature(false)
          addPendingCorrelationId(journey.correlationId)
        },
        onError: () => removePendingCorrelationId(journey.correlationId),
      }

      if (result.type === CallType.Evm && isEthereumSigner(signer)) {
        const { call, chain } = result

        const options = getClaimTxOptions(chain, result.type, {
          createLink: (txHash) => etherscan.tx(chain.key, txHash),
          ...commonCallbacks,
        })

        return signer.signAndSubmit(
          { data: call.data, to: call.to, value: call.value },
          options,
        )
      }

      if (result.type === CallType.Solana && isSolanaSigner(signer)) {
        const { call, chain } = result
        const isBatch = Array.isArray(call)

        if (isBatch) {
          return signer.signAndSendBatch(
            call,
            getClaimTxOptions(chain, result.type, {
              createLink: (bundleId) => jitoexplorer.bundle(bundleId),
              ...commonCallbacks,
            }),
          )
        } else {
          return signer.signAndSend(
            call.data,
            call.signers,
            getClaimTxOptions(chain, result.type, {
              createLink: (txHash) => solexplorer.tx(txHash),
              ...commonCallbacks,
            }),
          )
        }
      }

      if (result.type === CallType.Sui && isSuiSigner(signer)) {
        const { call, chain } = result

        const options = getClaimTxOptions(chain, result.type, commonCallbacks)
        return signer.signAndSend(call.data, options)
      }

      throw new Error("Unsupported claim transaction type")
    },
  })

  const isPending = mutation.isPending || isWaitingForSignature

  return { ...mutation, isPending }
}
