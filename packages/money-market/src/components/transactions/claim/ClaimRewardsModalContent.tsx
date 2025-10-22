import { normalize, UserIncentiveData } from "@aave/math-utils"
import { DollarSign } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Flex,
  Icon,
  Separator,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useEffect, useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { Reward } from "@/helpers/types"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useModalContext } from "@/hooks/useModal"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"

import { ClaimRewardsActions } from "./ClaimRewardsActions"
import { ClaimRewardsSelect } from "./ClaimRewardsSelect"

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const ClaimRewardsModalContent = () => {
  const { formatCurrency } = useAppFormatters()
  const { args } = useModalContext()
  const { user, reserves } = useAppDataContext()
  const { currentMarketData } = useProtocolDataContext()
  const [claimableUsd, setClaimableUsd] = useState("0")
  const [selectedRewardSymbol, setSelectedRewardSymbol] =
    useState<string>("all")
  const [rewards, setRewards] = useState<Reward[]>([])
  const [allReward, setAllReward] = useState<Reward>()

  // is Network mismatched
  const selectedReward =
    selectedRewardSymbol === "all"
      ? allReward
      : rewards.find((r) => r.symbol === selectedRewardSymbol)

  const underlyingAssetLower = args?.underlyingAsset?.toLocaleLowerCase()

  // get all rewards
  useEffect(() => {
    const userIncentives: Reward[] = []
    let totalClaimableUsd = Number(claimableUsd)
    const allAssets: string[] = []
    Object.keys(user.calculatedUserIncentives)
      .filter(
        (rewardTokenAddress) =>
          !underlyingAssetLower ||
          rewardTokenAddress.toLocaleLowerCase() === underlyingAssetLower,
      )
      .forEach((rewardTokenAddress) => {
        const incentive: UserIncentiveData =
          user.calculatedUserIncentives[rewardTokenAddress]
        const rewardBalance = normalize(
          incentive.claimableRewards,
          incentive.rewardTokenDecimals,
        )

        let tokenPrice = 0
        // getting price from reserves for the native rewards for v2 markets
        if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
          reserves.forEach((reserve) => {
            if (reserve.isWrappedBaseAsset) {
              tokenPrice = Number(reserve.priceInUSD)
            }
          })
        } else {
          tokenPrice = Number(incentive.rewardPriceFeed)
        }

        const rewardBalanceUsd = Number(rewardBalance) * tokenPrice

        if (rewardBalanceUsd > 0) {
          incentive.assets.forEach((asset) => {
            if (allAssets.indexOf(asset) === -1) {
              allAssets.push(asset)
            }
          })

          userIncentives.push({
            assets: incentive.assets,
            incentiveControllerAddress: incentive.incentiveControllerAddress,
            symbol: incentive.rewardTokenSymbol,
            balance: rewardBalance,
            balanceUsd: rewardBalanceUsd.toString(),
            rewardTokenAddress,
          })

          totalClaimableUsd = totalClaimableUsd + Number(rewardBalanceUsd)
        }
      })

    if (userIncentives.length === 1) {
      setSelectedRewardSymbol(userIncentives[0].symbol)
    } else if (userIncentives.length > 1 && !selectedReward) {
      const allRewards = {
        assets: allAssets,
        incentiveControllerAddress:
          userIncentives[0].incentiveControllerAddress,
        symbol: "all",
        balance: "0",
        balanceUsd: totalClaimableUsd.toString(),
        rewardTokenAddress: "",
      }
      setSelectedRewardSymbol("all")
      setAllReward(allRewards)
    }

    setRewards(userIncentives)
    setClaimableUsd(totalClaimableUsd.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noRewardBalance = claimableUsd === "0"

  const filteredRewards = rewards.filter(({ symbol }) =>
    selectedRewardSymbol === "all" ? true : symbol === selectedRewardSymbol,
  )

  const hasMultipleRewards = rewards.length > 1

  return (
    <>
      {hasMultipleRewards && (
        <>
          <Flex
            justify="space-between"
            align="center"
            direction={["column", "row"]}
            gap={10}
            mb="var(--modal-content-padding)"
          >
            <Text fs="p2" fw={700} lh={1}>
              Rewards(s) to claim
            </Text>
            <ClaimRewardsSelect
              rewards={rewards}
              selectedReward={selectedRewardSymbol}
              setSelectedReward={setSelectedRewardSymbol}
            />
          </Flex>
          <Separator mx="var(--modal-content-inset)" />
        </>
      )}
      <Stack
        separated
        separator={<Separator mx="var(--modal-content-inset)" />}
        withTrailingSeparator
        mt={!hasMultipleRewards && "var(--modal-content-inset)"}
      >
        {filteredRewards.length > 0 && (
          <TableContainer
            my="var(--modal-content-padding)"
            borderStyle="solid"
            borderWidth={1}
            borderColor={getToken("details.separators")}
            borderRadius="lg"
          >
            <Table size="small">
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead sx={{ textAlign: "end" }}>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRewards.map(
                  ({ balance, balanceUsd, symbol, rewardTokenAddress }) => (
                    <TableRow key={`claim-${rewardTokenAddress}`}>
                      <TableCell>
                        <Flex align="center" gap={6}>
                          <ReserveLogo address={rewardTokenAddress} />
                          <Text fs={14} fw={600}>
                            {symbol}
                          </Text>
                        </Flex>
                      </TableCell>
                      <TableCell>
                        <Flex direction="column" align="flex-end">
                          <Text fs={13} fw={500}>
                            {formatCurrency(balance, { symbol })}
                          </Text>
                          <Text fs={12} lh={1} color={getToken("text.medium")}>
                            {formatCurrency(balanceUsd, {
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ),
                )}
                {filteredRewards.length > 1 && (
                  <TableRow>
                    <TableCell>
                      <Flex align="center" gap={6}>
                        <Icon
                          size={24}
                          component={DollarSign}
                          sx={{ scale: 0.75 }}
                        />
                        <Text fs={14} fw={600}>
                          Total worth
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Text fs={15} fw={600} align="right">
                        {formatCurrency(claimableUsd, {
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {noRewardBalance && (
          <Alert
            variant="error"
            sx={{ my: 14 }}
            description="Your reward balance is 0"
          />
        )}
      </Stack>

      <ClaimRewardsActions
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={noRewardBalance}
      />
    </>
  )
}
