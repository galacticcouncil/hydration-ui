import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { useTokenBalance } from "api/balances"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"
import { Farm, useOraclePrice } from "api/farms"
import { useMemo } from "react"
import { scale, scaleHuman } from "utils/balance"
import { useTranslation } from "react-i18next"

export const useZodSchema = (
  id: string,
  farms: Farm[],
  withoutMaxBalance: boolean,
) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const { data: balance } = useTokenBalance(id, account?.address)
  const oraclePrice = useOraclePrice(assets.hub.id, id)

  const meta = assets.getAsset(id)

  const minDeposit = useMemo(() => {
    return farms.reduce((acc, farm) => {
      const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

      return minDeposit.gt(acc) ? minDeposit : acc
    }, BN_0)
  }, [farms])

  if (!balance) return undefined

  const rule = required.refine(
    (value) => {
      const valueInHub = scale(value, meta.decimals)
        .times(oraclePrice.data?.price?.n ?? 1)
        .div(oraclePrice.data?.price?.d ?? 1)

      return (
        valueInHub.gte(minDeposit) &&
        scale(value, meta.decimals).gte(minDeposit)
      )
    },
    t("farms.modal.join.minDeposit", {
      value: scaleHuman(
        minDeposit
          .times(oraclePrice.data?.price?.d ?? 1)
          .div(oraclePrice.data?.price?.n ?? 1),

        meta.decimals,
      ),
    }),
  )

  return z.object({
    amount: withoutMaxBalance
      ? rule
      : rule.pipe(maxBalance(balance?.balance ?? BN_0, meta.decimals)),
  })
}
