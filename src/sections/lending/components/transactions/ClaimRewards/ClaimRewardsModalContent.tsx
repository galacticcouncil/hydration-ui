import { normalize, UserIncentiveData } from "@aave/math-utils"
import { Text } from "components/Typography/Text/Text"
import { useEffect, useState } from "react"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsNumberLineWithSub,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { Reward } from "sections/lending/helpers/types"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { ClaimRewardsActions } from "./ClaimRewardsActions"
import { RewardsSelect } from "./RewardsSelect"
import { Separator } from "components/Separator/Separator"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useTranslation } from "react-i18next"

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const ClaimRewardsModalContent = () => {
  const { t } = useTranslation()
  const { mainTxState: claimRewardsTxState, txError, args } = useModalContext()
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

  // error handling
  let blockingError: ErrorType | undefined = undefined
  if (claimableUsd === "0") {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE
  }

  // error handling render
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <span>Your reward balance is 0</span>
      default:
        return null
    }
  }

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />
  }
  if (claimRewardsTxState.success)
    return (
      <TxSuccessView
        action={<span>Claimed</span>}
        amount={selectedReward?.balanceUsd}
      />
    )

  return (
    <>
      {blockingError !== undefined && (
        <Text color="red400">{handleBlocked()}</Text>
      )}
      {rewards.length > 1 && (
        <>
          <RewardsSelect
            rewards={rewards}
            selectedReward={selectedRewardSymbol}
            setSelectedReward={setSelectedRewardSymbol}
          />
          <Separator sx={{ my: 20 }} />
        </>
      )}
      {selectedReward && (
        <TxModalDetails>
          {selectedRewardSymbol === "all" && (
            <>
              <Row
                caption={<span>Balance</span>}
                sx={{ mb: selectedReward.symbol !== "all" ? 0 : 4 }}
              >
                <div sx={{ flex: "column", align: "flex-end" }}>
                  {rewards.map((reward) => (
                    <div
                      key={`claim-${reward.symbol}`}
                      sx={{ flex: "column", align: "flex-end", mb: 14 }}
                    >
                      <Text
                        fs={14}
                        sx={{ flex: "row", align: "center", gap: 8 }}
                      >
                        <TokenIcon
                          address={reward.rewardTokenAddress}
                          size={14}
                        />
                        {t("value.tokenWithSymbol", {
                          value: reward.balance,
                          symbol: reward.symbol,
                        })}
                      </Text>
                      <Text fs={12} color="basic400">
                        <DisplayValue value={Number(reward.balanceUsd)} isUSD />
                      </Text>
                    </div>
                  ))}
                </div>
              </Row>
              <Row caption={t("lending.totalWorth")}>
                <Text>
                  <DisplayValue value={Number(claimableUsd)} isUSD />
                </Text>
              </Row>
            </>
          )}
          {selectedRewardSymbol !== "all" && (
            <DetailsNumberLineWithSub
              symbol={selectedReward.symbol}
              iconAddress={selectedReward.rewardTokenAddress}
              futureValue={selectedReward.balance}
              futureValueUSD={selectedReward.balanceUsd}
              description={<span>{selectedReward.symbol} Balance</span>}
            />
          )}
        </TxModalDetails>
      )}
      {txError && <GasEstimationError txError={txError} />}
      <ClaimRewardsActions
        claimableUsd={claimableUsd}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      />
    </>
  )
}
