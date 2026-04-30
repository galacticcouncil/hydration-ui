import { ProtocolAction } from "@aave/contract-helpers"
import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import { HOLLAR_ASSET_ID, safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import {
  convertEvmTxRawToPapiTx,
  useApproveErc20,
  useErc20Allowance,
  useFacilitatorBucket,
  useGigaBorrowPoolContract,
  userGigaBorrowSummaryQueryKey,
  useUserGigaBorrowSummary,
} from "@/api/borrow"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toBigInt, toDecimal } from "@/utils/formatting"
import { positive } from "@/utils/validators"

type GigaHDXBorrowFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaHDXBorrow = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation(["common", "staking"])
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
  const { data: facilitatorBucketData, isSuccess: isFacilitatorBucketSuccess } =
    useFacilitatorBucket(hollarReserve?.reserve.aTokenAddress ?? "")

  const bucketCapacity = facilitatorBucketData?.facilitatorBucketCapacity ?? 0n
  const bucketLevel = facilitatorBucketData?.facilitatorBucketLevel ?? 0n
  const availableFromBucketWei =
    bucketCapacity > bucketLevel ? bucketCapacity - bucketLevel : 0n

  const userBorrowableWei = toBigInt(
    borrowableHollar || "0",
    hollarAsset.decimals,
  )
  const maxBorrowableWei =
    userBorrowableWei < availableFromBucketWei
      ? userBorrowableWei
      : availableFromBucketWei
  const maxBorrowableAmount = toDecimal(maxBorrowableWei, hollarAsset.decimals)

  const form = useForm<GigaHDXBorrowFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: hollarAsset,
    },
    resolver: !isFacilitatorBucketSuccess
      ? undefined
      : standardSchemaResolver(
          z.object({
            amount: positive.refine(
              (value) => new Big(value || "0").lte(maxBorrowableAmount || "0"),
              {
                error: t("staking:gigaStaking.borrow.error.borrowLimit"),
              },
            ),
            asset: z.custom<TAssetData>(),
          }),
        ),
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
    borrowableAmount: maxBorrowableAmount,
    variableBorrowApy: hollarReserve?.reserve.variableBorrowAPY ?? "0",
  }
}
