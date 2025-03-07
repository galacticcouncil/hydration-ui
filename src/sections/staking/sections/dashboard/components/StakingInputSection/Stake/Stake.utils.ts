import { maxBalance, required } from "utils/validators"
import { z } from "zod"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useMinStake } from "api/staking"
import { useTranslation } from "react-i18next"
import { scaleHuman } from "utils/balance"
import { create } from "zustand"

const MIN_INCREASE_PERCENTAGE = "1"

export const useStakeValidation = ({
  availableBalance,
  stakedBalance,
}: {
  availableBalance: BigNumber
  stakedBalance?: BigNumber
}) => {
  const { t } = useTranslation()
  const { native } = useAssets()
  const { data: minStakeConst } = useMinStake()

  if (!minStakeConst) return null

  const minIncreaseStakePosition = stakedBalance?.times(
    BigNumber(MIN_INCREASE_PERCENTAGE).div(100),
  )

  const minStake = minIncreaseStakePosition
    ? BigNumber.max(minIncreaseStakePosition, minStakeConst).toString()
    : minStakeConst
  const minStakeHuman = scaleHuman(minStake, native.decimals).toString()

  return {
    zodSchema: z.object({
      amount: required
        .pipe(maxBalance(availableBalance.toString(), native.decimals))
        .refine((value) => !BigNumber(value).lt(minStakeHuman), {
          message: t("staking.dashboard.form.stake.minStakeError", {
            value: minStakeHuman,
            symbol: native.symbol,
          }),
        }),
    }),
    value: minStakeHuman,
  }
}

type TIncreaseStakeStore = {
  value: string | undefined
  stakeValue: string | undefined
  diffDays: string | undefined
  update: (
    key: "value" | "diffDays" | "stakeValue",
    value: string | undefined,
  ) => void
}

export const useIncreaseStake = create<TIncreaseStakeStore>()((set) => ({
  value: undefined,
  stakeValue: undefined,
  diffDays: undefined,
  update: (key, value) => set(() => ({ [key]: value })),
}))
