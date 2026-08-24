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

  // Source-only deep links leave dest unset so XcmProvider's best-route
  // effect can pick Hydration (or the next priority dest) for this src pair.
  // Keeping wallet defaults would pin a stale destAsset from the previous src.
  const sourceOnlyPreset =
    !!parsedQueryParams?.srcChain &&
    parsedQueryParams.destChain === undefined &&
    parsedQueryParams.destAsset === undefined

  const withResolvedDest = sourceOnlyPreset
    ? { ...merged, destChain: null, destAsset: null }
    : merged

  const destChain = withResolvedDest.destChain
  const destAddress = withResolvedDest.destAddress ?? ""

  if (
    destChain &&
    destAddress &&
    !isAddressValidOnChain(destAddress, destChain)
  ) {
    return { ...withResolvedDest, destAddress: "", destAccount: null }
  }

  return withResolvedDest
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
