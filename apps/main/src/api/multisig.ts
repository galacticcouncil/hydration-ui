import { hydration } from "@galacticcouncil/descriptors"
import { safeStringify } from "@galacticcouncil/utils"
import { MultisigPendingTx, useAccount } from "@galacticcouncil/web3-connect"
import { getExtrinsicDecoder } from "@polkadot-api/tx-utils"
import { useQuery } from "@tanstack/react-query"
import { Binary } from "polkadot-api"

import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

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

export const useDecodedMultisigTx = (tx: MultisigPendingTx) => {
  const { papi, papiClient, isLoaded } = useRpcProvider()

  return useQuery({
    enabled: isLoaded && !!tx,
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
        tx: await papi.txFromCallData(
          Binary.fromBytes(decodedExtrinsic.callData),
        ),
        timestamp: Number(timestamp),
      }
    },
  })
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
