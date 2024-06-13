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
import BigNumber from "bignumber.js"
import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import { useOmnipoolAsset } from "api/omnipool"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"

export const useZodSchema = ({
  id,
  farms,
  position,
  enabled,
}: {
  id: string
  farms: Farm[]
  position?: Partial<HydraPositionsTableData>
  enabled: boolean
}) => {
  const assetId = enabled ? id : undefined
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const { data: balance } = useTokenBalance(assetId, account?.address)

  const meta = assets.getAsset(id)

  const omnipoolAsset = useOmnipoolAsset(assetId)
  const omnipoolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BigNumber; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = farm.globalFarm.minDeposit.toBigNumber()

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.globalFarm.incentivizedAsset.toString(),
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  const minDepositeValue = useMemo(() => {
    if (
      omnipoolAsset.data &&
      omnipoolBalance.data &&
      position?.providedAmount &&
      position?.shares &&
      position?.price
    ) {
      const value = calculate_liquidity_out(
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.providedAmount.toString(),
        position.shares.toString(),
        position.price.toFixed(0),
        minDeposit.value.toString(),
        "0",
      )

      return value
    }
  }, [minDeposit.value, omnipoolAsset.data, omnipoolBalance.data, position])

  const oraclePrice = useOraclePrice(minDeposit.assetId, assetId)

  if (!balance || !oraclePrice.data || assetId === undefined) return undefined

  const rule = required
    .refine(
      () => {
        if (position?.providedAmount) {
          const valueInHub = position.providedAmount
            .times(oraclePrice.data?.price?.n ?? 1)
            .div(oraclePrice.data?.price?.d ?? 1)

          return valueInHub.gte(minDeposit.value)
        }

        return true
      },
      () => {
        const maxValue = BigNumber.max(
          minDeposit.value
            .times(oraclePrice.data?.price?.d ?? 1)
            .div(oraclePrice.data?.price?.n ?? 1),
          minDepositeValue ?? BN_0,
        )

        return {
          message: t("farms.modal.join.minDeposit", {
            value: scaleHuman(maxValue, meta.decimals),
            symbol: meta.symbol,
          }),
        }
      },
    )
    .refine(
      (value) => {
        return scale(value, meta.decimals).gte(minDeposit.value)
      },
      t("farms.modal.join.minDeposit", {
        value: scaleHuman(minDepositeValue, meta.decimals),
        symbol: meta.symbol,
      }),
    )

  return z.object({
    amount: position
      ? rule
      : rule.pipe(maxBalance(balance?.balance ?? BN_0, meta.decimals)),
  })
}
