import { valueToBigNumber } from "@aave/math-utils"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { PercentageValue } from "components/PercentageValue"
import { FC, useState } from "react"
import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { NoData } from "sections/lending/components/primitives/NoData"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { LiquidationRiskParametresInfoModal } from "sections/lending/ui/risk-parametres/LiquidationRiskParametresModal"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { useBifrostVDotApy } from "api/external/bifrost"

export const DashboardHeaderValues: FC<{
  className?: string
}> = ({ className }) => {
  const { t } = useTranslation()
  const { user, loading } = useAppDataContext()
  const { currentAccount } = useWeb3Context()
  const [open, setOpen] = useState(false)
  //const { openClaimRewards } = useModalContext()

  /* const { claimableRewardsUsd } = Object.keys(
    user.calculatedUserIncentives,
  ).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData =
        user.calculatedUserIncentives[rewardTokenAddress]
      const rewardBalance = normalize(
        incentive.claimableRewards,
        incentive.rewardTokenDecimals,
      )

      let tokenPrice = 0
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === "AAVE")
          tokenPrice = aave ? Number(aave.priceInUSD) : 0
        } else {
          reserves.forEach((reserve) => {
            if (
              reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol
            ) {
              tokenPrice = Number(reserve.priceInUSD)
            }
          })
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed)
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice

      if (rewardBalanceUsd > 0) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol)
        }

        acc.claimableRewardsUsd += Number(rewardBalanceUsd)
      }

      return acc
    },
    { claimableRewardsUsd: 0, assets: [] } as {
      claimableRewardsUsd: number
      assets: string[]
    },
  ) */

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === "0"
      ? "0"
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || "1")
          .toFixed()

  const vDotSuppliedOrBorrowed = user.userReservesData.some(
    ({ reserve, underlyingBalance, totalBorrows }) =>
      reserve.symbol === "vDOT" &&
      (BN(underlyingBalance).gt(0) || BN(totalBorrows).gt(0)),
  )

  const { data: vDotApy, isLoading: isVDotApyLoading } = useBifrostVDotApy({
    enabled: vDotSuppliedOrBorrowed,
  })

  return (
    <>
      <div sx={{ maxWidth: ["100%", 1000] }} className={className}>
        <DataValueList separated>
          <DataValue
            labelColor="brightBlue300"
            label={t("lending.header.networth.title")}
            isLoading={loading}
          >
            {currentAccount ? (
              <DisplayValue value={Number(user?.netWorthUSD || 0)} isUSD />
            ) : (
              <NoData />
            )}
          </DataValue>
          <DataValue
            labelColor="brightBlue300"
            label={t("lending.header.netAPY.title")}
            tooltip={t("lending.header.netAPY.tooltip")}
            isLoading={loading}
          >
            {currentAccount && Number(user?.netWorthUSD) > 0 ? (
              <PercentageValue value={Number(user.netAPY) * 100} />
            ) : (
              <NoData />
            )}
          </DataValue>
          {vDotSuppliedOrBorrowed && vDotApy && (
            <DataValue
              labelColor="brightBlue300"
              label={t("lending.header.vdotAPY.title")}
              isLoading={loading || isVDotApyLoading}
            >
              <PercentageValue value={Number(vDotApy.apy)} />
            </DataValue>
          )}
          <DataValue
            labelColor="brightBlue300"
            label={t("lending.header.healthfactor.title")}
            isLoading={loading}
          >
            {currentAccount && user?.healthFactor !== "-1" ? (
              <HealthFactorNumber
                fontSize={19}
                value={user?.healthFactor || "-1"}
                onInfoClick={() => {
                  setOpen(true)
                }}
              />
            ) : (
              <NoData />
            )}
          </DataValue>
          {/* <DataValue
            labelColor="brightBlue300"
            label="Available rewards"
            isLoading={loading}
          >
            {currentAccount && claimableRewardsUsd > 0 ? (
              <div sx={{ flex: "row", gap: 10 }}>
                <DisplayValue value={claimableRewardsUsd} isUSD />
                <Button
                  variant="primary"
                  size="micro"
                  onClick={() => openClaimRewards()}
                >
                  <span>Claim</span>
                </Button>
              </div>
            ) : (
              <NoData />
            )}
          </DataValue> */}
        </DataValueList>
      </div>
      <LiquidationRiskParametresInfoModal
        open={open}
        setOpen={setOpen}
        healthFactor={user?.healthFactor || "-1"}
        loanToValue={loanToValue}
        currentLoanToValue={user?.currentLoanToValue || "0"}
        currentLiquidationThreshold={user?.currentLiquidationThreshold || "0"}
      />
    </>
  )
}
