import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useMultisigDeposit = (numSignatories: number) => {
  const { papi, isApiLoaded } = useRpcProvider()
  const { native } = useAssets()

  return useQuery({
    enabled: isApiLoaded && numSignatories > 0,
    queryKey: ["multisig", "deposit", numSignatories],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const papiAny = papi as any
      const [base, factor] = await Promise.all([
        papiAny.constants.Multisig.DepositBase() as Promise<bigint>,
        papiAny.constants.Multisig.DepositFactor() as Promise<bigint>,
      ])

      const deposit = base + factor * BigInt(numSignatories)
      return {
        deposit,
        depositHuman: scaleHuman(deposit, native.decimals),
        symbol: native.symbol,
      }
    },
  })
}

export const useMultisigSignerBalance = () => {
  const { account } = useAccount()
  const { papi, isApiLoaded } = useRpcProvider()
  const { native } = useAssets()

  const signerAddress = account?.isMultisig
    ? account.multisigSignerAddress
    : undefined

  return useQuery({
    enabled: isApiLoaded && !!signerAddress,
    queryKey: ["multisig", "signerBalance", signerAddress],
    queryFn: async () => {
      const balanceData =
        await papi.query.System.Account.getValue(signerAddress!)
      const free = balanceData.data.free
      const frozen = balanceData.data.frozen
      const transferable = free > frozen ? free - frozen : 0n
      return {
        transferable,
        transferableHuman: scaleHuman(transferable, native.decimals),
        symbol: native.symbol,
      }
    },
  })
}
