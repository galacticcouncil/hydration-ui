import { safeConvertAnyToH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { zeroAddress } from "viem"
import * as z from "zod/v4"

import i18n from "@/i18n"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

export const getTransferVaultPositionSchema = (
  balance: string,
  owner: string,
) => {
  const t = i18n.getFixedT(null, ["wallet", "common"])
  const schema = z.object({
    amount: required
      .refine(
        (value) => {
          try {
            new Big(value)
            return true
          } catch {
            return false
          }
        },
        { error: t("common:error.validNumber"), abort: true },
      )
      .pipe(positive)
      .check(validateFieldMaxBalance(balance))
      .refine((value) => {
        try {
          return Big(value).times(Big(10).pow(18)).mod(1).eq(0)
        } catch {
          return false
        }
      }, t("common:error.validNumber")),
    address: required
      .refine((value) => {
        const address = safeConvertAnyToH160(value)
        return !!address && address.toLowerCase() !== zeroAddress
      }, t("transfer.error.validAddress"))
      .refine(
        (value) =>
          safeConvertAnyToH160(value)?.toLowerCase() !==
          safeConvertAnyToH160(owner)?.toLowerCase(),
        t("transfer.error.notSame"),
      ),
  })
  return schema
}

export const useTransferVaultPositionForm = (balance: string) => {
  const { account } = useAccount()
  const schema = getTransferVaultPositionSchema(balance, account?.address ?? "")
  return useForm<TransferVaultPositionValues>({
    mode: "onChange",
    defaultValues: { amount: "", address: "" },
    resolver: standardSchemaResolver(schema),
  })
}

export type TransferVaultPositionValues = z.infer<
  ReturnType<typeof getTransferVaultPositionSchema>
>
