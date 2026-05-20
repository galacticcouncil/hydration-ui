import { hydration } from "@galacticcouncil/descriptors"
import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
  safeStringify,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  type MultisigAccount,
  type MultisigPendingTx,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { normalizeMultisigEntry } from "@galacticcouncil/web3-connect/src/utils/multisig"
import {
  AccountId,
  sortMultisigSignatories,
} from "@polkadot-api/substrate-bindings"
import { getExtrinsicDecoder } from "@polkadot-api/tx-utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { type SS58String, TxCallData } from "polkadot-api"
import { isNumber } from "remeda"
import { toHex } from "viem"

import type { WsPolkadotClient } from "@/api/provider"
import type { AnyPapiTx } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import type { Papi } from "@/providers/rpcProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

type TxWeight = {
  ref_time: bigint
  proof_size: bigint
}

type MultisigCallPointer = {
  id: string
  blockHash: string
  callIndex: number
}

export type DecodedMultisigCallResult = {
  tx: AnyPapiTx | null
  proposalTx: AnyPapiTx | null
}

type MultisigCallTimepoint = {
  height: number
  index: number
}

const ZERO_WEIGHT: TxWeight = { ref_time: 0n, proof_size: 0n }

const getOtherSigners = (
  signatories: SS58String[],
  caller: SS58String,
): SS58String[] => {
  const otherSigners = sortMultisigSignatories(
    signatories
      .filter((singer) => !stringEquals(singer, caller))
      .map((signer) => AccountId().enc(signer)),
  )
  return otherSigners.map((signer) => safeConvertPublicKeyToSS58(toHex(signer)))
}

const requireThreshold = (multisig: MultisigAccount): number => {
  if (!multisig.threshold) {
    throw new Error("Multisig threshold is missing")
  }
  return multisig.threshold
}

export const multisigPendingTxsQuery = (
  papi: Papi,
  address: string,
  enabled: boolean,
) =>
  queryOptions({
    enabled: enabled && !!address,
    queryKey: ["multisig", "pendingTxs", address],
    staleTime: Infinity,
    queryFn: async () => {
      const entries = await papi.query.Multisig.Multisigs.getEntries(address, {
        at: "best",
      })
      return entries.map(normalizeMultisigEntry)
    },
  })

export const useMultisigPendingTxs = (address: string) => {
  const { papi, isApiLoaded } = useRpcProvider()
  const normalized = safeConvertAddressSS58(address)

  return useQuery(multisigPendingTxsQuery(papi, normalized, isApiLoaded))
}

export const useMultisigDeposit = (numSignatories: number) => {
  const { papi, isApiLoaded } = useRpcProvider()
  const { native } = useAssets()

  return useQuery({
    enabled: isApiLoaded && numSignatories > 0,
    queryKey: ["multisig", "deposit", numSignatories],
    queryFn: async () => {
      const [base, factor] = await Promise.all([
        papi.constants.Multisig.DepositBase(),
        papi.constants.Multisig.DepositFactor(),
      ])
      const deposit = base + factor * BigInt(numSignatories)
      return {
        deposit: toDecimal(deposit, native.decimals),
        symbol: native.symbol,
      }
    },
  })
}

export const decodedMultisigTxQuery = (
  papi: Papi,
  papiClient: WsPolkadotClient,
  tx: MultisigPendingTx,
  enabled: boolean,
) =>
  queryOptions({
    enabled: enabled && !!tx,
    queryKey: ["multisig", "tx", safeStringify(tx)],
    retry: false,
    queryFn: async () => {
      const [metadata, blockHash] = await Promise.all([
        hydration.getMetadata(),
        papiClient._request<string>("chain_getBlockHash", [tx.when.height]),
      ])
      const decoder = getExtrinsicDecoder(metadata)

      const [body, timestamp] = await Promise.all([
        papiClient.getBlockBody(blockHash),
        papi.query.Timestamp.Now.getValue({
          at: blockHash,
        }),
      ])

      const extrinsic = body[tx.when.index]
      if (!extrinsic)
        return {
          tx: null,
          timestamp: Number(timestamp),
        }

      const decodedExtrinsic = decoder(extrinsic)
      return {
        tx: await papi.txFromCallData(decodedExtrinsic.callData),
        timestamp: Number(timestamp),
      }
    },
  })

export const useDecodedMultisigTx = (tx: MultisigPendingTx) => {
  const { papi, papiClient, isLoaded } = useRpcProvider()
  return useQuery(decodedMultisigTxQuery(papi, papiClient, tx, isLoaded))
}

const getMultisigTimepoint = (tx: AnyPapiTx): MultisigCallTimepoint | null => {
  const value = tx.decodedCall?.value

  const timepoint = value?.value?.timepoint
  if (!isNumber(timepoint?.height) || !isNumber(timepoint?.index)) return null

  return { height: timepoint.height, index: timepoint.index }
}

export const getOuterMultisigCallType = (
  tx: AnyPapiTx | null | undefined,
): string | null => {
  const value = tx?.decodedCall?.value
  return typeof value?.type === "string" ? value.type : null
}

const decodeExtrinsicAtTimepoint = async (
  papi: Papi,
  papiClient: WsPolkadotClient,
  decoder: ReturnType<typeof getExtrinsicDecoder>,
  timepoint: MultisigCallTimepoint,
): Promise<AnyPapiTx | null> => {
  const blockHash = await papiClient._request<string>("chain_getBlockHash", [
    timepoint.height,
  ])
  const body = await papiClient.getBlockBody(blockHash)
  const extrinsic = body[timepoint.index]
  if (!extrinsic) return null

  const decodedExtrinsic = decoder(extrinsic)
  return papi.txFromCallData(decodedExtrinsic.callData)
}

export const decodedMultisigCallQuery = (
  papi: Papi,
  papiClient: WsPolkadotClient,
  call: MultisigCallPointer,
  enabled: boolean,
) =>
  queryOptions({
    enabled: enabled && !!call.blockHash,
    queryKey: [
      "multisig",
      "historyCall",
      call.id,
      call.blockHash,
      call.callIndex,
    ],
    retry: false,
    queryFn: async () => {
      const metadata = await hydration.getMetadata()
      const decoder = getExtrinsicDecoder(metadata)
      const body = await papiClient.getBlockBody(call.blockHash)

      const extrinsic = body[call.callIndex]
      if (!extrinsic) {
        return {
          tx: null,
          proposalTx: null,
        }
      }

      const decodedExtrinsic = decoder(extrinsic)
      const tx = await papi.txFromCallData(decodedExtrinsic.callData)
      const timepoint = getMultisigTimepoint(tx)

      let proposalTx: AnyPapiTx | null = null
      if (timepoint) {
        proposalTx = await decodeExtrinsicAtTimepoint(
          papi,
          papiClient,
          decoder,
          timepoint,
        )
      }

      return {
        tx,
        proposalTx,
      }
    },
  })

export const useDecodedMultisigCall = (call: MultisigCallPointer) => {
  const { papi, papiClient, isLoaded } = useRpcProvider()
  return useQuery(decodedMultisigCallQuery(papi, papiClient, call, isLoaded))
}

export const useMultisigSignerBalance = () => {
  const { account } = useAccount()
  const { sdk, isApiLoaded } = useRpcProvider()
  const { native } = useAssets()

  const signerAddress = account?.isMultisig
    ? account.multisigSignerAddress
    : undefined

  return useQuery({
    enabled: isApiLoaded && !!signerAddress,
    queryKey: ["multisig", "signerBalance", signerAddress],
    queryFn: async () => {
      if (!signerAddress) throw new Error("Invalid signer address")
      const { transferable } =
        await sdk.client.balance.getSystemBalance(signerAddress)

      return {
        transferable: toDecimal(transferable, native.decimals),
        symbol: native.symbol,
      }
    },
  })
}

export const getDecodedProposalTx = async (papi: Papi, call: TxCallData) => {
  const txPallets = papi.tx as Record<
    string,
    Record<string, (args?: unknown) => AnyPapiTx>
  >
  const tx = txPallets[call.type]?.[call.value.type]
  if (!tx) {
    throw new Error(
      `Unsupported transaction call: ${call.type}.${call.value.type}`,
    )
  }
  return tx(call.value.value)
}

export const buildAsMulti = (
  papi: Papi,
  caller: SS58String,
  multisig: MultisigAccount,
  call: TxCallData,
  weight?: TxWeight,
  when?: MultisigPendingTx["when"],
): AnyPapiTx => {
  return papi.tx.Multisig.as_multi({
    threshold: requireThreshold(multisig),
    other_signatories: getOtherSigners(
      multisig.signatories.map((s) =>
        safeConvertPublicKeyToSS58(s.signatory.pubKey),
      ),
      caller,
    ),
    maybe_timepoint: when,
    call,
    max_weight: weight || ZERO_WEIGHT,
  })
}

export const buildApproveAsMulti = (
  papi: Papi,
  caller: SS58String,
  multisig: MultisigAccount,
  tx: MultisigPendingTx,
): AnyPapiTx =>
  papi.tx.Multisig.approve_as_multi({
    threshold: requireThreshold(multisig),
    other_signatories: getOtherSigners(
      multisig.signatories.map((s) =>
        safeConvertPublicKeyToSS58(s.signatory.pubKey),
      ),
      caller,
    ),
    maybe_timepoint: tx.when,
    call_hash: tx.callHash,
    max_weight: ZERO_WEIGHT,
  })

export const buildCancelAsMulti = (
  papi: Papi,
  caller: SS58String,
  multisig: MultisigAccount,
  tx: MultisigPendingTx,
): AnyPapiTx =>
  papi.tx.Multisig.cancel_as_multi({
    threshold: requireThreshold(multisig),
    other_signatories: getOtherSigners(
      multisig.signatories.map((s) =>
        safeConvertPublicKeyToSS58(s.signatory.pubKey),
      ),
      caller,
    ),
    timepoint: tx.when,
    call_hash: tx.callHash,
  })
