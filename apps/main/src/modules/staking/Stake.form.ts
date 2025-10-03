import { bigMax } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { refine, z } from "zod/v4"

import { minStake } from "@/api/staking"
import i18n from "@/i18n"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

const getSchema = (balance: string, minStake: string) =>
  z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => Big(value || "0").gte(minStake), {
          error: i18n.t("staking:stake.stake.minStakeError"),
        }),
      )
      .check(validateFieldMaxBalance(balance)),
  })

export type StakeFormValues = z.infer<ReturnType<typeof getSchema>>

export const useStakeForm = (balance: string, minStakeIncrement: string) => {
  const rpc = useRpcProvider()
  const { native } = useAssets()

  const { data: minStakeConst, isLoading: minStakeLoading } = useQuery(
    minStake(rpc),
  )

  const defaultValues: StakeFormValues = {
    amount: "",
  }

  const minStakeUsed = bigMax(
    minStakeIncrement,
    scaleHuman(minStakeConst ?? 0n, native.decimals),
  ).toString()

  const form = useForm<StakeFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(getSchema(balance, minStakeUsed)),
    disabled: minStakeLoading,
  })

  return {
    form,
    minStakeUsed,
  }
}
