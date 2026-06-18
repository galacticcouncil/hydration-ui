import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import {
  destChainAssetPairs,
  sourceChainAssetPairs,
  XcAsset,
  XcChain,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { positive, required, requiredObject } from "@/utils/validators"

const schema = z
  .object({
    srcChain: requiredObject<XcChain>(),
    srcAsset: requiredObject<XcAsset>(),
    srcAmount: positive,
    destChain: requiredObject<XcChain>(),
    destAsset: requiredObject<XcAsset>(),
    destAmount: positive,
    destAddress: required,
  })
  .superRefine((data, ctx) => {
    if (
      data.destChain &&
      data.destAddress &&
      !data.destChain.addressValidator(data.destAddress)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["destAddress"],
        message: "Invalid destination address",
      })
    }
  })

export type XcSwapFormValues = z.infer<typeof schema>

export const useXcSwapForm = () => {
  const source = sourceChainAssetPairs[0]
  const dest = destChainAssetPairs[1]

  const defaultValues: XcSwapFormValues = {
    srcChain: source?.chain ?? null,
    srcAsset: source?.asset ?? null,
    srcAmount: "",
    destChain: dest?.chain ?? null,
    destAsset: dest?.asset ?? null,
    destAmount: "",
    destAddress: "",
  }

  return useForm<XcSwapFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(schema),
  })
}
