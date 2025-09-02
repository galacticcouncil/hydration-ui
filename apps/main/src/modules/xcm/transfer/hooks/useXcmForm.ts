import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { useXcmFormSchema } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

export const useXcmForm = () => {
  const { account } = useAccount()

  // Get default values based on address type
  const address = account?.rawAddress ?? ""
  const defaults = getXcmFormDefaults(address)

  return useForm({
    resolver: standardSchemaResolver(useXcmFormSchema()),
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
