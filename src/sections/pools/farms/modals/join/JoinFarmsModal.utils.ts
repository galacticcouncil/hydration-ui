import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { useTokenBalance } from "api/balances"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"
import { Farm } from "api/farms"
import { useMemo } from "react"
import { scale, scaleHuman } from "utils/balance"
import { useTranslation } from "react-i18next"

export const useZodSchema = (
  id: string,
  farms: Farm[],
  isRedeposit: boolean,
) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const { data: balance } = useTokenBalance(id, account?.address)

  const meta = assets.getAsset(id)

  const minDeposit = useMemo(() => {
    return farms.reduce((acc, farm) => {
      const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

      return minDeposit.gt(acc) ? minDeposit : acc
    }, BN_0)
  }, [farms])

  if (!balance) return undefined

  const rule = required.refine(
    (value) => scale(value, meta.decimals).gte(minDeposit),
    t("farms.modal.join.minDeposit", {
      value: scaleHuman(minDeposit, meta.decimals),
    }),
  )

  return z.object({
    amount: isRedeposit
      ? rule
      : rule.pipe(maxBalance(balance?.balance ?? BN_0, meta.decimals)),
  })
}
