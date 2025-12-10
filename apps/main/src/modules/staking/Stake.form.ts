import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { refine, z } from "zod/v4"

import { stakingConstsQuery } from "@/api/constants"
import i18n from "@/i18n"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

const MIN_INCREASE_PERCENTAGE = 1

const getSchema = (balance: string, minStake: string, nativeSymbol: string) =>
  z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => Big(value || "0").gte(minStake), {
          error: i18n.t("staking:stake.stake.minStakeError", {
            amount: i18n.t("currency", {
              value: minStake,
              symbol: nativeSymbol,
            }),
          }),
        }),
      )
      .check(validateFieldMaxBalance(balance)),
  })

export type StakeFormValues = z.infer<ReturnType<typeof getSchema>>

export const useStakeForm = (balance: string, stakedBalance: string) => {
  const rpc = useRpcProvider()
  const { native } = useAssets()

  const { data: stakingConsts, isLoading: minStakeLoading } = useQuery(
    stakingConstsQuery(rpc),
  )

  const defaultValues: StakeFormValues = {
    amount: "",
  }

  const minIncreaseStakePosition = Big(stakedBalance)
    .times(MIN_INCREASE_PERCENTAGE)
    .div(100)
    .toString()

  const minStakeUsed = Big.max(
    minIncreaseStakePosition,
    toDecimal(stakingConsts?.minStake ?? 0n, native.decimals),
  ).toString()

  const form = useForm<StakeFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(
      getSchema(balance, minStakeUsed, native.symbol),
    ),
    disabled: minStakeLoading,
    mode: "onChange",
  })

  return {
    form,
    minStake: minStakeUsed,
  }
}
