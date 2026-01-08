import { useAccount } from "@galacticcouncil/web3-connect"
import { Transfer } from "@galacticcouncil/xc-sdk"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { useXcmFormSchema } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

export const useXcmForm = (transfer: Transfer | null) => {
  const { account } = useAccount()

  const address = account?.address ?? ""
  const defaults = getXcmFormDefaults(account)

  return useForm({
    resolver: standardSchemaResolver(useXcmFormSchema(transfer)),
    mode: "onChange",
    defaultValues: {
      srcChain: defaults.srcChain,
      srcAsset: defaults.srcAsset,

      destChain: defaults.destChain,
      destAsset: defaults.destAsset,

      srcAmount: "",
      destAmount: "",

      destAddress: address,
      destAccount: account ?? null,
    },
  })
}
