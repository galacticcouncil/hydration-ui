import { STHDX_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { Flex, Paper, Separator } from "@galacticcouncil/ui/components"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useBorrowPoolDataContract } from "@/api/borrow/contracts"
import {
  borrowReservesQuery,
  gigaLendingPoolAddressProvider,
  useUserGigaBorrowSummary,
} from "@/api/borrow/queries"
import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import { GigaStake } from "@/modules/staking/gigaStaking/GigaStake"
import { GigaUnstake } from "@/modules/staking/gigaStaking/GigaUnstake"
import { SHeaderTab } from "@/modules/trade/swap/components/FormHeader/FormHeader.styled"
import { useRpcProvider } from "@/providers/rpcProvider"

const stakeOptions = ["stake", "unstake"] as const
type StakeOption = (typeof stakeOptions)[number]

export const GigaAction = () => {
  const { t } = useTranslation("staking")
  const [type, setType] = useState<StakeOption>("stake")
  const rpc = useRpcProvider()
  const { data: constants } = useQuery(gigaStakeConstantsQuery(rpc))
  const { data: gigaPoolReserves } = useQuery(
    borrowReservesQuery(
      rpc,
      gigaLendingPoolAddressProvider,
      useBorrowPoolDataContract(),
      null,
    ),
  )
  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()

  const hdxReserve = gigaPoolReserves?.formattedReserves.find(
    (reserve) =>
      reserve.underlyingAsset === getAddressFromAssetId(STHDX_ASSET_ID),
  )

  //@TODO: add skeletons
  if (!constants || !hdxReserve || !gigaBorrowSummary) return null

  return (
    <Paper asChild>
      <Flex direction="column">
        <Flex px="xl" py="m" align="center" gap="m">
          {stakeOptions.map((option) => (
            <SHeaderTab
              key={option}
              data-status={option === type ? "active" : "inactive"}
              onClick={() => setType(option)}
            >
              {t(`gigaStaking.tabs.${option}`)}
            </SHeaderTab>
          ))}
        </Flex>

        <Separator />

        {type === "stake" ? (
          <GigaStake minStake={constants.minStake} hdxReserve={hdxReserve} />
        ) : (
          <GigaUnstake userBorrowSummary={gigaBorrowSummary} />
        )}
      </Flex>
    </Paper>
  )
}
