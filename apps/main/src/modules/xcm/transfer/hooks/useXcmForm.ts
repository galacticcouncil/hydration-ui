import { useAccount } from "@galacticcouncil/web3-connect"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  useXcmFormSchema,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmQueryParams } from "@/modules/xcm/transfer/hooks/useXcmQueryParams"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

type UseXcmFormOptions = {
  syncWithQueryParams?: boolean
  defaultValues?: Partial<XcmFormValues>
}

export const useXcmForm = (
  transfer: Transfer | null,
  options?: UseXcmFormOptions,
) => {
  const { account } = useAccount()

  const { syncWithQueryParams = true, defaultValues } = options ?? {}

  const { parsedQueryParams, updateQueryParams } = useXcmQueryParams()
  const defaults = defaultValues || {
    ...getXcmFormDefaults(account),
    ...parsedQueryParams,
  }

  const form = useForm({
    resolver: standardSchemaResolver(useXcmFormSchema(transfer)),
    mode: "onChange",
    defaultValues: {
      srcChain: defaults.srcChain ?? null,
      srcAsset: defaults.srcAsset ?? null,

      destChain: defaults.destChain ?? null,
      destAsset: defaults.destAsset ?? null,

      srcAmount: defaults.srcAmount ?? "",
      destAmount: defaults.destAmount ?? "",

      destAddress: defaults.destAddress ?? "",
      destAccount: defaults.destAccount ?? null,
    },
  })

  const [srcChain, srcAsset, destChain, destAsset] = form.watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
  ])

  useEffect(() => {
    if (!syncWithQueryParams) return
    updateQueryParams({
      srcChain: srcChain?.key,
      srcAsset: srcAsset?.key,
      destChain: destChain?.key,
      destAsset: destAsset?.key,
    })
  }, [
    syncWithQueryParams,
    destAsset,
    destChain,
    srcAsset,
    srcChain,
    updateQueryParams,
  ])

  return form
}
