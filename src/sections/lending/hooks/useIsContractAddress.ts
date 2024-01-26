import { useQuery } from "@tanstack/react-query"
import { useRootStore } from "sections/lending/store/root"
import { getProvider } from "sections/lending/utils/marketsAndNetworksConfig"

export const useIsContractAddress = (address: string) => {
  const chainId = useRootStore((store) => store.currentChainId)
  const provider = getProvider(chainId)

  return useQuery({
    queryFn: () => provider.getCode(address),
    queryKey: ["isContractAddress", address],
    enabled: true,
    staleTime: Infinity,
    select: (data) => data !== "0x",
  })
}
