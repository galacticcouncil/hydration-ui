import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { LOOPER_FACTORY_ABI } from "@/modules/strategies/multiply/config/abi"
import { MULTIPLY_QUERY_KEY_PREFIX } from "@/modules/strategies/multiply/config/constants"
import {
  LOOPER_FACTORY_ADDRESS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { getSliderMaxLeverage } from "@/modules/strategies/multiply/utils/projection"
import { useRpcProvider } from "@/providers/rpcProvider"

// The factory's own cap, floored like the slider. The open form takes the
// lower of this and the reserve-derived cap, so `open` never reverts LeverageTooHigh.
export const useFactoryMaxLeverage = (pair: MultiplyPair) => {
  const { evm, isReady } = useRpcProvider()
  const factory = LOOPER_FACTORY_ADDRESS

  return useQuery({
    queryKey: [MULTIPLY_QUERY_KEY_PREFIX, "maxLeverage", factory, pair.slug],
    queryFn: async () => {
      const wad = await evm.readContract({
        address: factory!,
        abi: LOOPER_FACTORY_ABI,
        functionName: "maxLeverage",
        args: [pair.collateral, pair.eMode, pair.minHf],
      })
      return getSliderMaxLeverage(Number(formatUnits(wad, 18)))
    },
    enabled: isReady && !!factory,
    retry: false,
  })
}
