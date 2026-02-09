import { useAccount } from "@galacticcouncil/web3-connect"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useXcmFormSchema } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmQueryParams } from "@/modules/xcm/transfer/hooks/useXcmQueryParams"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

export const useXcmForm = (transfer: Transfer | null) => {
  const { account } = useAccount()

  const { parsedQueryParams, updateQueryParams } = useXcmQueryParams()
  const defaults = {
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
    updateQueryParams({
      srcChain: srcChain?.key,
      srcAsset: srcAsset?.key,
      destChain: destChain?.key,
      destAsset: destAsset?.key,
    })
  }, [destAsset, destChain, srcAsset, srcChain, updateQueryParams])

  return form
}
