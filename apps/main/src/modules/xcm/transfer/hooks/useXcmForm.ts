import { useAccount } from "@galacticcouncil/web3-connect"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import {
  useXcmFormSchema,
  XcmFormValues,
} from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

export const useXcmForm = (
  transfer: Transfer | null,
  defaultValues?: Partial<XcmFormValues>,
) => {
  const { account } = useAccount()

  const defaults = defaultValues || getXcmFormDefaults(account)

  return useForm({
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
}
