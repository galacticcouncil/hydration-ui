import { ProtocolAction } from "@aave/contract-helpers"
import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { HOLLAR_ASSET_ID, safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"

import { TAssetData } from "@/api/assets"
import {
  convertEvmTxRawToPapiTx,
  useApproveErc20,
  useErc20Allowance,
  useGigaBorrowPoolContract,
  userGigaBorrowSummaryQueryKey,
  useUserGigaBorrowSummary,
} from "@/api/borrow"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toBigInt } from "@/utils/formatting"

type GigaHDXBorrowFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaHDXBorrow = ({ onClose }: { onClose: () => void }) => {
  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()
  const { getAssetWithFallback } = useAssets()
  const { account } = useAccount()
  const provider = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { data: gigaBorrowPoolContract } = useGigaBorrowPoolContract()
  const approveErc20 = useApproveErc20()
  const getErc20Allowance = useErc20Allowance()

  const { borrowableHollar, userSummary, hollarReserve } =
    gigaBorrowSummary ?? {}
  const hollarAsset = getAssetWithFallback(HOLLAR_ASSET_ID)

  const borrowableAmount = borrowableHollar?.borrowableHollar ?? "0"
  const maxBorrowableWei = BigInt(borrowableHollar?.borrowableHollarWei ?? "0")

  const form = useForm<GigaHDXBorrowFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: hollarAsset,
    },
  })

  const amount = form.watch("amount")

  const borrowAmountUsd = Big(amount || "0").mul(
    hollarReserve?.reserve.priceInUSD || "0",
  )
  const futureBorrowBalance = Big(userSummary?.totalBorrowsUSD || "0").plus(
    borrowAmountUsd,
  )
  const futureHealthFactorRaw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      userSummary?.totalCollateralUSD || "0",
    borrowBalanceMarketReferenceCurrency: futureBorrowBalance.toString(),
    currentLiquidationThreshold:
      userSummary?.currentLiquidationThreshold || "0",
  })
  const healthFactor = formatHealthFactorResult({
    currentHF: userSummary?.healthFactor || "-1",
    futureHF: futureHealthFactorRaw.toString(),
  })

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!gigaBorrowPoolContract)
        throw new Error("Giga borrow pool contract not found")

      if (!account?.address || !hollarReserve?.underlyingAsset) return

      const amountWei = toBigInt(amount, hollarAsset.decimals)
      const evmAddress = safeConvertAnyToH160(account.address)
      const poolInstance = gigaBorrowPoolContract.getContractInstance(
        gigaBorrowPoolContract.poolAddress,
      )
      const spender = gigaBorrowPoolContract.poolAddress
      const tokenAddress = hollarReserve.underlyingAsset

      const allowance = await getErc20Allowance(
        tokenAddress,
        evmAddress,
        spender,
      )

      const txRaw = await poolInstance.populateTransaction.borrow(
        hollarReserve.underlyingAsset,
        amountWei,
        2,
        0,
        evmAddress,
      )

      const evmCall = await convertEvmTxRawToPapiTx(
        provider,
        txRaw,
        evmAddress,
        ProtocolAction.borrow,
      )

      if (allowance === 0n) {
        const approveEvmCall = await approveErc20(
          gigaBorrowPoolContract,
          tokenAddress,
          evmAddress,
        )

        await createTransaction(
          {
            tx: provider.papi.tx.Utility.batch_all({
              calls: [
                provider.papi.tx.Dispatcher.dispatch_evm_call({
                  call: approveEvmCall.decodedCall,
                }).decodedCall,
                provider.papi.tx.Dispatcher.dispatch_evm_call({
                  call: evmCall.decodedCall,
                }).decodedCall,
              ],
            }),
            invalidateQueries: [userGigaBorrowSummaryQueryKey(account.address)],
          },
          { onSubmitted: onClose },
        )
      } else {
        await createTransaction(
          {
            tx: provider.papi.tx.Dispatcher.dispatch_evm_call({
              call: evmCall.decodedCall,
            }),
            invalidateQueries: [userGigaBorrowSummaryQueryKey(account.address)],
          },
          { onSubmitted: onClose },
        )
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.amount)
  })

  return {
    form,
    healthFactor,
    onSubmit,
    mutation,
    maxBorrowableWei,
    borrowableAmount,
    variableBorrowApy: hollarReserve?.reserve.variableBorrowAPY ?? "0",
  }
}
