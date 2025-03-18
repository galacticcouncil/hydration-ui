import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAsset } from "@/providers/assetsProvider"
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"
import {
  maxBalanceError,
  required,
  requiredAny,
  validateMaxBalance,
} from "@/utils/validators"

const useSchema = () => {
  const balances = useAccountData((data) => data.balances)

  return z
    .object({
      address: z.string().pipe(required),
      asset: z.custom<TAsset | null>().refine(...requiredAny),
      amount: z.string().pipe(required),
    })
    .refine(
      ({ asset, amount }) => {
        const balance = scaleHuman(
          balances[asset?.id ?? ""]?.free ?? 0n,
          asset?.decimals ?? 12,
        )

        return validateMaxBalance(balance, amount || "0")
      },
      {
        path: ["amount"],
        message: maxBalanceError,
      },
    )
}

export type TransferPositionFormValues = z.infer<ReturnType<typeof useSchema>>

export const useTransferPositionForm = () => {
  const defaultValues: TransferPositionFormValues = {
    address: "",
    asset: null,
    amount: "",
  }

  return useForm<TransferPositionFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(useSchema()),
  })
}
