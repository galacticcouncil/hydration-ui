import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { Account, useAccount } from "@galacticcouncil/web3-connect"
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

type ResolveXcmFormDefaultsArgs = {
  account: Account | null
  defaultValues?: Partial<XcmFormValues>
  parsedQueryParams?: Partial<XcmFormValues>
}

const resolveXcmFormDefaults = ({
  account,
  defaultValues,
  parsedQueryParams,
}: ResolveXcmFormDefaultsArgs): Partial<XcmFormValues> => {
  const merged = defaultValues ?? {
    ...getXcmFormDefaults(account),
    ...parsedQueryParams,
  }

  const destChain = merged.destChain
  const destAddress = merged.destAddress ?? ""

  if (
    destChain &&
    destAddress &&
    !isAddressValidOnChain(destAddress, destChain)
  ) {
    return { ...merged, destAddress: "", destAccount: null }
  }

  return merged
}

export const useXcmForm = (
  transfer: Transfer | null,
  options?: UseXcmFormOptions,
) => {
  const { account } = useAccount()

  const { syncWithQueryParams = true, defaultValues } = options ?? {}

  const { parsedQueryParams, updateQueryParams } = useXcmQueryParams()
  const defaults = resolveXcmFormDefaults({
    account,
    defaultValues,
    parsedQueryParams,
  })

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
      bridgeProvider: null,
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
