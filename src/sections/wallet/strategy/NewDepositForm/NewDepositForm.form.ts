import { TAsset, useAssets } from "providers/assets"
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
import { useAccountBalances } from "api/deposits"

const useSchema = () => {
  const { data: accountAssets } = useAccountBalances()
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
export type NewDepositFormOptions = {
  defaultAssetId: string
}

export const useNewDepositForm = ({
  defaultAssetId,
}: NewDepositFormOptions) => {
  const { getAsset } = useAssets()

  const defaultValues: NewDepositFormValues = {
    asset: getAsset(defaultAssetId) ?? null,
    amount: "",
  }

  const form = useForm<NewDepositFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(useSchema()),
  })

  return form
}
