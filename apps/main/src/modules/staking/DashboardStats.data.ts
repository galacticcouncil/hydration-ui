import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { stakeQuery, subscanHDXSupplyQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_DECIMALS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const useDashboardStats = () => {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const accountAddress = account?.address

  const { data: stakeData, isLoading: stakeLoading } = useQuery(
    stakeQuery(rpc, accountAddress ?? ""),
  )

  const { data: hdxSupply, isLoading: hdxSupplyLoading } = useQuery(
    subscanHDXSupplyQuery,
  )

  const circulatingSupply = Big(hdxSupply?.available_balance || "0")

  const supplyStaked =
    stakeData && circulatingSupply.gt(0)
      ? Big(stakeData.total_stake.toString())
          .div(circulatingSupply)
          .mul(100)
          .toString()
      : "0"

  return {
    supplyStaked,
    circulatingSupply: scaleHuman(
      circulatingSupply.toString(),
      NATIVE_ASSET_DECIMALS,
    ),
    isLoading: stakeLoading || hdxSupplyLoading,
    projectedAPR: 500,
  }
}
