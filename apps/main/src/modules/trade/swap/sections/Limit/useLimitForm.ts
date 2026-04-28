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
  /**
   * Lock toggle. When true, sell is forced to stay in `lastTwo`
   * regardless of touch recency — buy/price edits derive each other
   * around a fixed sell value.
   */
  isLocked: z.boolean(),
  /**
   * The two most-recently-touched fields, ordered most-recent first.
   * The third field (not in this pair) is the one that derives via
   * `buy = sell × price`. Updated on every user touch via the cascade
   * logic in cascadeLogic.ts.
   *
   * Initial value `["price", "sell"]` makes `buy` the derived field
   * on form mount: as soon as the user types into sell, buy fills
   * from `sell × marketPrice`. Typing buy first instead flips it.
   */
  lastTwo: z.tuple([
    z.enum(["sell", "buy", "price"]),
    z.enum(["sell", "buy", "price"]),
  ]),
  /**
   * Only relevant when `price` is in `lastTwo` (i.e. price is one of
   * the two kept fields). "market" → mirror live market price every
   * block; "user" → frozen at user-typed value (or pill % preset).
   * When price is the derived field, this flag is unused.
   */
  priceAnchor: z.enum(["market", "user"]),
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
    lastTwo: ["price", "sell"],
    priceAnchor: "market",
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
