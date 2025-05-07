import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAsset, useAssets } from "@/providers/assetsProvider"
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
        error: maxBalanceError,
      },
    )
}

export type TransferPositionFormValues = z.infer<ReturnType<typeof useSchema>>

type Props = {
  readonly assetId?: string
}

export const useTransferPositionForm = (props?: Props) => {
  const { getAsset } = useAssets()
  const asset = props?.assetId ? (getAsset(props?.assetId) ?? null) : null

  const defaultValues: TransferPositionFormValues = {
    address: "",
    asset: asset,
    amount: "",
  }

  return useForm<TransferPositionFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}
