import { TAsset } from "providers/assets"
import {
  maxBalanceError,
  positive,
  required,
  requiredAny,
  validateMaxBalance,
} from "utils/validators"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAccountAssets } from "api/deposits"

const useSchema = () => {
  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  return z
    .object({
      asset: z.custom<TAsset | null>().refine(...requiredAny),
      amount: z.string().pipe(required).pipe(positive),
    })
    .refine(
      ({ asset, amount }) => {
        const selectedAssetBalance =
          accountAssetsMap?.get(asset?.id ?? "")?.balance?.balance || "0"

        return validateMaxBalance(
          selectedAssetBalance,
          amount || "0",
          asset?.decimals || 0,
        )
      },
      {
        path: ["amount"],
        message: maxBalanceError,
      },
    )
}

export type NewDepositFormValues = z.infer<ReturnType<typeof useSchema>>

export const useNewDepositForm = () => {
  const defaultValues: NewDepositFormValues = {
    asset: null,
    amount: "",
  }

  const form = useForm<NewDepositFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(useSchema()),
  })

  return form
}
