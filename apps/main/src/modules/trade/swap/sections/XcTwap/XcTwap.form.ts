import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { millisecondsInDay } from "date-fns/constants"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import {
  getTimeFrameMillis,
  getTimeFrameSchema,
  TIME_FRAME_MS,
} from "@/components/TimeFrame/TimeFrame.utils"
import i18n from "@/i18n"
import { useTradeForm } from "@/modules/trade/swap/lib/useTradeForm"
import {
  DcaOrdersMode,
  dcaTimeFrameTypes,
  DEFAULT_DCA_DURATION,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { XcAsset, XcChain } from "@/modules/trade/swap/sections/XcSwap/types"
import { XcTwapErrorView } from "@/modules/trade/swap/sections/XcTwap/utils/errors"
import {
  getXcMaxOrders,
  getXcMinBudget,
  XC_TWAP_MIN_ORDERS,
} from "@/modules/trade/swap/sections/XcTwap/utils/orders"
import { TAsset } from "@/providers/assetsProvider"
import { toBigInt, toDecimal } from "@/utils/formatting"
import {
  maxBalanceError,
  positiveOptional,
  requiredObject,
  validateMaxBalance,
  validNumber,
} from "@/utils/validators"

const MAX_YEAR_FRAME = 5
const MAX_TIME_FRAME_MS = millisecondsInDay * MAX_YEAR_FRAME * 365

const ordersSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(DcaOrdersMode.Auto),
    value: z.never().optional(),
  }),
  z.object({
    type: z.literal(DcaOrdersMode.Custom),
    value: validNumber
      .min(XC_TWAP_MIN_ORDERS, {
        error: i18n.t("trade:dca.errors.minOrders", {
          count: XC_TWAP_MIN_ORDERS,
        }),
      })
      .nullable(),
  }),
])

const schema = z
  .object({
    sellAsset: requiredObject<TAsset>(),
    sellAmount: positiveOptional,
    destChain: requiredObject<XcChain>(),
    buyAsset: requiredObject<XcAsset>(),
    destAddress: z.string(),
    duration: getTimeFrameSchema(dcaTimeFrameTypes),
    orders: ordersSchema,
  })
  .superRefine(({ destChain, destAddress }, { addIssue }) => {
    if (!destChain || destChain.platform === HYDRATION_CHAIN_KEY) return

    const address = destAddress.trim()

    if (!address) {
      addIssue({
        code: "custom",
        path: ["destAddress"],
        message: i18n.t("error.required"),
      })
    } else if (!destChain.addressValidator(address)) {
      addIssue({
        code: "custom",
        path: ["destAddress"],
        message: i18n.t("trade:xc.swap.error.destAddressInvalid"),
      })
    }
  })
  .superRefine(({ duration }, { addIssue }) => {
    if (getTimeFrameMillis(duration) <= MAX_TIME_FRAME_MS) return

    const maxInUnit = Math.floor(
      MAX_TIME_FRAME_MS / TIME_FRAME_MS[duration.type],
    )

    addIssue({
      code: "custom",
      path: ["duration.value"],
      message: i18n.t("error.timeFrameDurationMax", {
        value: i18n.t(duration.type, { count: maxInUnit }),
      }),
    })
  })

export type XcTwapFormValues = z.infer<typeof schema>

const getAmountIn = ({ sellAsset, sellAmount }: XcTwapFormValues) =>
  sellAsset && sellAmount ? toBigInt(sellAmount, sellAsset.decimals) : 0n

// `leastIn` and `errorView` come from the last estimate; the order limits
// wait for it

const useSchema = (
  maxBalance: string,
  leastIn: bigint | null,
  errorView: XcTwapErrorView,
) => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()

  const refinedSchema = schema.superRefine((form, { addIssue }) => {
    const { sellAsset, buyAsset, duration, orders } = form

    if (errorView.recipient === "recipientRejected") {
      addIssue({
        code: "custom",
        path: ["destAddress"],
        message: t("trade:xc.twap.error.recipientRejected", {
          symbol: buyAsset?.symbol,
        }),
      })
    }

    if (!sellAsset || leastIn === null) return

    const amountIn = getAmountIn(form)
    const minBudget = getXcMinBudget(leastIn)
    const addMinBudgetIssue = () =>
      addIssue({
        code: "custom",
        path: ["sellAmount"],
        message: t("trade:dca.errors.minBudgetTooLow", {
          value: t("currency", {
            value: toDecimal(minBudget, sellAsset.decimals),
            symbol: sellAsset.symbol,
          }),
        }),
      })

    if (amountIn > 0n && amountIn < minBudget) {
      addMinBudgetIssue()
      return
    }

    if (orders.type === DcaOrdersMode.Custom && orders.value) {
      const maxOrders = getXcMaxOrders(
        getTimeFrameMillis(duration),
        amountIn,
        amountIn > 0n ? leastIn : 0n,
      )

      // Explains the estimate's OrderTooSmall better than the budget does
      if (orders.value > maxOrders) {
        addIssue({
          code: "custom",
          path: ["orders.value"],
          message: t("trade:xc.twap.error.maxOrders", { count: maxOrders }),
        })
        return
      }
    }

    if (errorView.sellAmount === "minBudget") {
      addMinBudgetIssue()
    } else if (errorView.sellAmount === "belowEd") {
      addIssue({
        code: "custom",
        path: ["sellAmount"],
        message: t("trade:xc.twap.error.belowEd"),
      })
    }
  })

  if (!account) {
    return refinedSchema
  }

  // `twap()` doesn't check balances, so the form does
  return refinedSchema.refine(
    (form) => validateMaxBalance(maxBalance, form.sellAmount),
    {
      error: maxBalanceError,
      path: ["sellAmount"],
    },
  )
}

type Args = {
  readonly sellAsset: TAsset | null
  readonly maxBalance: string
  readonly leastIn: bigint | null
  readonly errorView: XcTwapErrorView
}

export const useXcTwapForm = ({
  sellAsset,
  maxBalance,
  leastIn,
  errorView,
}: Args) => {
  const { account } = useAccount()
  const form = useTradeForm<XcTwapFormValues>({
    mode: "onChange",
    defaultValues: {
      sellAsset,
      sellAmount: "",
      destChain: null,
      buyAsset: null,
      destAddress: "",
      duration: DEFAULT_DCA_DURATION,
      orders: { type: DcaOrdersMode.Auto },
    },
    resolver: standardSchemaResolver(useSchema(maxBalance, leastIn, errorView)),
  })

  const { trigger, getFieldState, getValues } = form

  useEffect(() => {
    const { isDirty, isTouched } = getFieldState("sellAmount")
    if (!account || (!isDirty && !isTouched)) return

    void trigger("sellAmount")
  }, [account, maxBalance, getFieldState, trigger])

  useEffect(() => {
    if (leastIn === null) return

    void trigger(["sellAmount", "orders.value"])
  }, [leastIn, trigger])

  // Estimate errors come and go with the estimate, not with a field change
  const { recipient, sellAmount } = errorView
  useEffect(() => {
    if (getValues("destAddress").trim()) void trigger("destAddress")
  }, [recipient, getValues, trigger])

  useEffect(() => {
    if (getValues("sellAmount")) void trigger("sellAmount")
  }, [sellAmount, getValues, trigger])

  return form
}
