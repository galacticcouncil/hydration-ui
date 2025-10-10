import Big from "big.js"
import { FieldValues, Path } from "react-hook-form"
import * as z from "zod/v4"

import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { SELL_ONLY_ASSETS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

const requiredError = i18n.t("error.required")

export const required = z.string().trim().min(1, requiredError)

export const validNumber = z.number({ error: i18n.t("error.validNumber") })

export const requiredObject = <T extends Record<string, unknown>>() =>
  z.custom<T | null>().check(
    z.refine((value) => value !== null, {
      error: requiredError,
    }),
  )

export const WSS_REGEX =
  /^wss?:\/\/(localhost|[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]+)?(\/.*)?$/i

export const validWebsocketUrl = z
  .string()
  .refine((value) => WSS_REGEX.test(value), i18n.t("error.invalidWebsocketUrl"))

const _validNumberBig = (optional?: boolean) =>
  z.string().refine(
    (value) => {
      try {
        new Big(value)
        return true
      } catch {
        return false
      }
    },
    {
      error: i18n.t("error.validNumber"),
      when: optional ? ({ value }) => value !== "" : undefined,
    },
  )

export const validNumberBig = _validNumberBig()

const _positive = (optional?: boolean) =>
  z
    .string()
    .pipe(_validNumberBig(optional))
    .refine((value) => new Big(value || "0").gt(0), {
      error: i18n.t("error.positive"),
      when: optional ? ({ value }) => value !== "" : undefined,
    })

export const positive = _positive()
export const positiveOptional = _positive(true)

export const maxBalanceError = i18n.t("error.maxBalance")

export const validateMaxBalance = (
  balance: string | number,
  amount: string,
): boolean => new Big(amount || "0").lte(balance)

export const validateFieldMaxBalance = (balance: string | number) =>
  z.refine<string>((value) => validateMaxBalance(balance, value), {
    error: maxBalanceError,
  })

export const useValidateFormMaxBalance = () => {
  const { getBalance } = useAccountBalances()

  return <TFormValues extends FieldValues>(
    path: Path<NoInfer<TFormValues>>,
    selectData: (form: TFormValues) => [asset: TAsset | null, amount: string],
  ) =>
    z.refine<TFormValues>(
      (form) => {
        const [asset, amount] = selectData(form)

        if (!asset) {
          return true
        }

        const balance = getBalance(asset.id)?.transferable.toString() || "0"
        const balanceHuman = scaleHuman(balance, asset.decimals)

        return validateMaxBalance(balanceHuman, amount)
      },
      {
        error: maxBalanceError,
        path: [path],
      },
    )
}

const existentialDepositError = i18n.t("error.existentialDeposit")

const validateExistentialDeposit = (
  asset: TAsset | undefined | null,
  amount: string,
  multiplier: number | undefined,
): boolean =>
  !multiplier ||
  !asset ||
  new Big(scaleHuman(asset.existentialDeposit, asset.decimals))
    .mul(multiplier)
    .lte(amount || "0")

export const validateFieldExistentialDeposit = (
  asset: TAsset | undefined | null,
  multiplier: number | undefined,
) =>
  z.refine<string>(
    (value) =>
      value === ""
        ? true
        : validateExistentialDeposit(asset, value, multiplier),
    existentialDepositError,
  )

export const validateFormExistentialDeposit = <TFormValues extends FieldValues>(
  path: Path<NoInfer<TFormValues>>,
  selectData: (
    form: TFormValues,
  ) => [multiplier: number | undefined, asset: TAsset | null, amount: string],
) =>
  z.refine<TFormValues>(
    (form) => {
      const [multiplier, asset, amount] = selectData(form)

      return amount === ""
        ? true
        : validateExistentialDeposit(asset, amount, multiplier)
    },
    {
      error: maxBalanceError,
      path: [path],
    },
  )

export const validateAssetSellOnly = z.refine<TAsset | null>(
  (asset) => !asset || !SELL_ONLY_ASSETS.includes(asset.id),
  {
    error: i18n.t("error.sellOnly"),
  },
)
