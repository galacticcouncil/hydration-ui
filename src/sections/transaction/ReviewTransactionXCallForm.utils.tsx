import { TransactionRequest } from "@ethersproject/providers"
import { XCall } from "@galacticcouncil/xcm-sdk"
import { useQuery } from "@tanstack/react-query"
import BN from "bignumber.js"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { QUERY_KEYS } from "utils/queryKeys"

export function isXCall(x: XCall | undefined): x is XCall {
  return typeof x === "object" && "abi" in x && "data" in x
}

export function useTransactionCost({
  signer,
  tx,
}: {
  signer: MetaMaskSigner
  tx: TransactionRequest
}) {
  return useQuery(
    QUERY_KEYS.evmTxCost(tx?.data?.toString() ?? ""),
    async () => {
      const [gas, gasPrice] = await signer.getGasValues(tx)

      return new BN(gas.mul(gasPrice).toString())
    },
    {
      enabled:
        signer instanceof MetaMaskSigner &&
        Boolean(tx?.from && tx?.to && tx?.data),
    },
  )
}
