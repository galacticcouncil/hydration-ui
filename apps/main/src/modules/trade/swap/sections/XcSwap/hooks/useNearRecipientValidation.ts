import { EvmAddr, NearAddr } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { nearAccountQuery } from "@/api/near"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { XcChain } from "@/modules/trade/swap/sections/XcSwap/types"

// 1Click pays wNEAR out as native NEAR, which creates an implicit (hex or
// 0x…) account, so only named accounts have to exist beforehand
const isImplicitAccount = (address: string) =>
  NearAddr.isImplicit(address) || EvmAddr.isValid(address)

export const useNearRecipientValidation = (
  destChain: XcChain | null,
  destAddress: string,
) => {
  const address = destAddress.trim()
  const [debouncedAddress, isAddressSynced] = useDebouncedValue(address)
  const shouldCheck =
    destChain?.platform === "near" &&
    destChain.addressValidator(address) &&
    !isImplicitAccount(address)

  const { data, isPending, isError } = useQuery({
    ...nearAccountQuery(destChain?.key ?? "", debouncedAddress),
    enabled: shouldCheck && isAddressSynced,
  })

  if (!shouldCheck) return "notApplicable" as const
  if (!isAddressSynced || isPending) return "checking" as const
  if (isError) return "unavailable" as const
  return data ? ("exists" as const) : ("missing" as const)
}
