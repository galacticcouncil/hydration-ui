import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
  validateAssetSellOnly,
} from "@/utils/validators"

export const EXPIRY_OPTIONS = ["15min", "30min", "1h", "1d", "open"] as const
export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number]

const schemaBase = z.object({
  sellAsset: requiredObject<TAssetData>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAssetData>().check(validateAssetSellOnly),
  buyAmount: positiveOptional,
  limitPrice: positiveOptional,
  expiry: z.enum(EXPIRY_OPTIONS),
  partiallyFillable: z.boolean(),
  /** Lock toggle: false = price-sacred (default), true = sell-sacred */
  isLocked: z.boolean(),
  /**
   * Which amount was last touched by the user. On price change we
   * recalculate the OTHER amount so the user's last explicit input
   * is preserved. Lock ON overrides this and always forces 'sell'.
   */
  amountAnchor: z.enum(["sell", "buy"]),
  /**
   * "spot" → limitPrice mirrors the live spot price every block.
   * "user" → user has typed / edited a custom price or deviation %,
   *          so we stop auto-syncing. Reset to "spot" by clicking the
   *          Spot button or by changing assets.
   */
  priceAnchor: z.enum(["spot", "user"]),
})

export type LimitFormValues = z.infer<typeof schemaBase>

const useSchema = () => {
  const { account } = useAccount()
  const refineMaxBalance = useValidateFormMaxBalance()

  if (!account) {
    return schemaBase
  }

  return schemaBase.check(
    refineMaxBalance("sellAmount", (form) => [form.sellAsset, form.sellAmount]),
  )
}

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useLimitForm = ({ assetIn, assetOut }: Args) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

  const defaultValues: LimitFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    buyAmount: "",
    limitPrice: "",
    expiry: "open",
    partiallyFillable: true,
    isLocked: false,
    amountAnchor: "sell",
    priceAnchor: "spot",
  }

  const form = useForm<LimitFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })

  const { trigger, getValues } = form

  useEffect(() => {
    const { sellAsset } = getValues()

    if (!account || !sellAsset) {
      return
    }

    if (isBalanceLoaded(sellAsset.id) || !isBalanceLoading) {
      trigger("sellAmount")
    }
  }, [account, isBalanceLoading, trigger, getValues, isBalanceLoaded])

  return form
}
