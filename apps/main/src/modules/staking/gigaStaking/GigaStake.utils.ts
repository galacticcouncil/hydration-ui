import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow/queries"
import { evmAccountBindingQuery } from "@/api/evm"
import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import i18n from "@/i18n"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toBigInt, toDecimal } from "@/utils/formatting"
import { useValidateFormMaxBalance } from "@/utils/validators"

type GigaStakeFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaStake = () => {
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const refineMaxBalance = useValidateFormMaxBalance()
  const { data: constants } = useQuery(gigaStakeConstantsQuery(rpc))
  const minStake = toDecimal(constants?.minStake ?? 0n, native.decimals)

  const form = useForm<GigaStakeFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: native,
    },
    //@TODO: add validation for max supply cap
    resolver: constants
      ? standardSchemaResolver(
          z
            .object({ amount: z.string(), asset: z.custom<TAssetData>() })
            .check(
              z.refine<GigaStakeFormValues>(
                ({ amount }) => amount === "" || Big(amount).gte(minStake),
                {
                  error: i18n.t("staking:stake.stake.minStakeError", {
                    amount: i18n.t("currency", {
                      value: minStake,
                      symbol: native.symbol,
                    }),
                  }),
                  path: ["amount"],
                },
              ),
            )
            .check(
              refineMaxBalance("amount", (form) => [form.asset, form.amount]),
            ),
        )
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakeTx = unsafeApi.tx.GigaHdx.giga_stake({
        hdx_amount: toBigInt(amount, native.decimals),
      })

      const isBound = await rpc.queryClient.ensureQueryData(
        evmAccountBindingQuery(rpc, address),
      )

      if (!isBound) {
        return createTransaction(
          {
            tx: rpc.papi.tx.Utility.batch_all({
              calls: [
                rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
                stakeTx.decodedCall,
              ],
            }),
            invalidateQueries: [userGigaBorrowSummaryQueryKey(address)],
          },
          { onSuccess: () => form.reset() },
        )
      }

      return createTransaction(
        {
          tx: stakeTx,
          invalidateQueries: [userGigaBorrowSummaryQueryKey(address)],
        },
        { onSuccess: () => form.reset() },
      )
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.amount)
  })

  return {
    form,
    meta: native,
    minStake,
    onSubmit,
  }
}
