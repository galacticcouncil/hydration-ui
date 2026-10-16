import {
  etherscan,
  getVaaHeader,
  nearblocks,
  solexplorer,
} from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import {
  isEthereumSigner,
  isNearSigner,
  isSolanaSigner,
  isSuiSigner,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { CallType } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useZecWithdrawalsStore } from "@/modules/xcm/history/hooks/useZecWithdrawalsStore"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import {
  buildClaimCall,
  findNearRecipient,
  getJourneyVaaRaw,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"
import {
  parseNttTransfer,
  toNearUniversal,
} from "@/modules/xcm/history/utils/nearNtt"
import { toDecimal } from "@/utils/formatting"

import { useClaimTxOptions } from "./useClaimTxOptions"

export function useWithdrawClaim(journey: XcJourney) {
  const { t } = useTranslation("xcm")
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false)
  const { addPendingCorrelationId, removePendingCorrelationId } =
    usePendingClaimsStore()
  const { findWithdrawal, removeWithdrawal } = useZecWithdrawalsStore(
    useShallow(pick(["findWithdrawal", "removeWithdrawal"])),
  )

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

      // A zcash withdrawal paid a 1Click deposit address, which the vaa names
      // by hash only: the claim passes it in plain, from this browser's record
      // or the copy its sender published on the source chain
      const vaaRaw = getJourneyVaaRaw(journey)
      const payee = vaaRaw
        ? parseNttTransfer(getVaaHeader(vaaRaw).payload)?.to
        : undefined
      const withdrawal = payee ? findWithdrawal(payee) : undefined
      const depositAddress =
        withdrawal?.depositAddress ??
        (payee && payee !== toNearUniversal(account.rawAddress)
          ? await findNearRecipient(journey)
          : undefined)

      const result = await buildClaimCall(
        journey,
        account.rawAddress,
        depositAddress,
      )

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
              createLink: (txHash) => solexplorer.tx(txHash),
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

      if (result.type === CallType.Near && isNearSigner(signer)) {
        const { call, chain } = result
        const toastParams = { value, symbol }

        return signer.signAndSend(
          call,
          chain,
          getClaimTxOptions(chain, result.type, {
            createLink: (txHash) => nearblocks.tx(chain.key, txHash),
            ...commonCallbacks,
            // Claimed into the deposit address, 1Click sends it on to Zcash
            ...(depositAddress && {
              onSuccess: () => {
                if (withdrawal) removeWithdrawal(withdrawal.txHash)
              },
              titles: {
                submitted: t("zecWithdrawal.toast.submitted", toastParams),
                success: t("zecWithdrawal.toast.success", toastParams),
                error: t("zecWithdrawal.toast.error", toastParams),
              },
            }),
          }),
        )
      }

      throw new Error("Unsupported claim transaction type")
    },
  })

  const isPending = mutation.isPending || isWaitingForSignature

  return { ...mutation, isPending }
}
