import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { useTokenBalance } from "api/balances"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"
import { Farm } from "api/farms"
import { useMemo } from "react"
import { scale, scaleHuman } from "utils/balance"
import i18n from "i18next"
import BN from "bignumber.js"

export const useZodSchema = (id: string, farms: Farm[]) => {
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const { data: balance } = useTokenBalance(id, account?.address)

  const meta = assets.getAsset(id)

  const minDeposit = useMemo(() => {
    return farms.reduce((acc, farm) => {
      const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

      return minDeposit.gt(acc) ? minDeposit : acc
    }, BN(10000000))
  }, [farms])

  if (!balance) return undefined

  return z.object({
    amount: required
      .pipe(maxBalance(balance?.balance ?? BN_0, meta.decimals))
      .refine(
        (value) => scale(value, meta.decimals).gte(minDeposit),
        i18n.t("farms.modal.join.minDeposit", {
          value: scaleHuman(minDeposit, meta.decimals),
        }),
      ),
  })
}
