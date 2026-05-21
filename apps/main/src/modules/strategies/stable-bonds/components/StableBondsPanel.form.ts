import { useForm } from "react-hook-form"

import type { TAssetData } from "@/api/assets"

export type StableBondsFormValues = {
  depositAsset: TAssetData | null
  depositAmount: string
}

export const useStableBondsForm = () => {
  return useForm<StableBondsFormValues>({
    defaultValues: {
      depositAsset: null,
      depositAmount: "",
    },
    mode: "onChange",
  })
}
