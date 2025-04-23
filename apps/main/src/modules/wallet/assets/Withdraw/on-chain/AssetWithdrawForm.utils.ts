import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { WithdrawChain } from "@/modules/wallet/assets/Withdraw/on-chain/ChainMenu"
import { TAsset } from "@/providers/assetsProvider"
import { required, requiredAny } from "@/utils/validators"

const schema = z.object({
  chain: z.custom<WithdrawChain | null>().refine(...requiredAny),
  asset: z.custom<TAsset | null>().refine(...requiredAny),
  amount: required,
  address: required,
})

export type AssetWithdrawFormValues = z.infer<typeof schema>

export const useAssetWithdraForm = () => {
  const defaultValues: AssetWithdrawFormValues = {
    chain: "Hydration",
    asset: null,
    amount: "",
    address: "",
  }

  const form = useForm<AssetWithdrawFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  return form
}
