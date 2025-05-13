import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import { Flex, Stack } from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import React, { useMemo, useState } from "react"

import { MoneyMarketAssetInput } from "@/components/MoneyMarketAssetInput"
import { TxModalWrapperProps } from "@/components/transactions/TxModalWrapper"
import { IsolationModeWarning } from "@/components/transactions/warnings/IsolationModeWarning"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "@/hooks/useAssetCaps"
import { useModalContext } from "@/hooks/useModal"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"
import { getMaxAmountAvailableToSupply } from "@/utils/getMaxAmountAvailableToSupply"
import { getAssetCollateralType } from "@/utils/transactions"
import { roundToTokenDecimals } from "@/utils/utils"

import { SupplyActions } from "./SupplyActions"

export enum ErrorType {
  CAP_REACHED,
}

export const SupplyModalContent = React.memo(
  ({
    underlyingAsset,
    poolReserve,
    userReserve,
    isWrongNetwork,
    nativeBalance,
    tokenBalance,
  }: TxModalWrapperProps) => {
    const { marketReferencePriceInUsd, user } = useAppDataContext()
    const { currentNetworkConfig } = useProtocolDataContext()
    const { mainTxState: supplyTxState } = useModalContext()
    const { supplyCap: supplyCapUsage, debtCeiling: debtCeilingUsage } =
      useAssetCaps()
    const minRemainingBaseTokenBalance = useRootStore(
      (state) => state.poolComputed.minRemainingBaseTokenBalance,
    )

    // states
    const [amount, setAmount] = useState("")
    const supplyUnWrapped =
      underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()

    const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance

    const supplyApy = poolReserve.supplyAPY
    const {
      supplyCap,
      totalLiquidity,
      isFrozen,
      decimals,
      debtCeiling,
      isolationModeTotalDebt,
    } = poolReserve

    // Calculate max amount to supply
    const maxAmountToSupply = useMemo(
      () =>
        getMaxAmountAvailableToSupply(
          walletBalance,
          {
            supplyCap,
            totalLiquidity,
            isFrozen,
            decimals,
            debtCeiling,
            isolationModeTotalDebt,
          },
          underlyingAsset,
          minRemainingBaseTokenBalance,
        ),
      [
        walletBalance,
        supplyCap,
        totalLiquidity,
        isFrozen,
        decimals,
        debtCeiling,
        isolationModeTotalDebt,
        underlyingAsset,
        minRemainingBaseTokenBalance,
      ],
    )

    const handleChange = (value: string) => {
      if (value === "-1") {
        setAmount(maxAmountToSupply)
      } else {
        const decimalTruncatedValue = roundToTokenDecimals(
          value,
          poolReserve.decimals,
        )
        setAmount(decimalTruncatedValue)
      }
    }

    console.log({
      amount,
      res: poolReserve.formattedPriceInMarketReferenceCurrency,
    })

    // Calculation of future HF
    const amountIntEth = Big(amount || 0).mul(
      poolReserve.formattedPriceInMarketReferenceCurrency,
    )
    // TODO: is it correct to ut to -1 if user doesnt exist?
    const amountInUsd = bigShift(
      amountIntEth.mul(marketReferencePriceInUsd),
      -USD_DECIMALS,
    )
    const totalCollateralMarketReferenceCurrencyAfter = user
      ? Big(user.totalCollateralMarketReferenceCurrency).plus(amountIntEth)
      : "-1"

    const liquidationThresholdAfter = user
      ? Big(user.totalCollateralMarketReferenceCurrency)
          .mul(user.currentLiquidationThreshold)
          .plus(
            amountIntEth.mul(poolReserve.formattedReserveLiquidationThreshold),
          )
          .div(totalCollateralMarketReferenceCurrencyAfter)
      : "-1"

    const isMaxSelected = amount === maxAmountToSupply
    const isMaxExceeded = !!amount && BigNumber(amount).gt(maxAmountToSupply)

    let healthFactorAfterDeposit = user
      ? valueToBigNumber(user.healthFactor)
      : "-1"

    if (
      user &&
      ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
        (user.isInIsolationMode &&
          user.isolatedReserve?.underlyingAsset ===
            poolReserve.underlyingAsset))
    ) {
      healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: valueToBigNumber(
          totalCollateralMarketReferenceCurrencyAfter.toString(),
        ),
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
          user.totalBorrowsMarketReferenceCurrency,
        ),
        currentLiquidationThreshold: valueToBigNumber(
          liquidationThresholdAfter.toString(),
        ),
      })
    }

    // ************** Warnings **********
    // isolation warning
    const hasDifferentCollateral = user.userReservesData.find(
      (reserve) =>
        reserve.usageAsCollateralEnabledOnUser &&
        reserve.reserve.id !== poolReserve.id,
    )
    const showIsolationWarning: boolean =
      !user.isInIsolationMode &&
      poolReserve.isIsolated &&
      !hasDifferentCollateral &&
      (userReserve && userReserve.underlyingBalance !== "0"
        ? userReserve.usageAsCollateralEnabledOnUser
        : true)

    // collateralization state
    const collateralType = getAssetCollateralType(
      userReserve,
      user.totalCollateralUSD,
      user.isInIsolationMode,
      debtCeilingUsage.isMaxed,
    )

    const supplyActionsProps = {
      amountToSupply: amount,
      isWrongNetwork,
      poolAddress: supplyUnWrapped
        ? API_ETH_MOCK_ADDRESS
        : poolReserve.underlyingAsset,
      symbol: supplyUnWrapped
        ? currentNetworkConfig.baseAssetSymbol
        : poolReserve.symbol,
      blocked: isMaxExceeded,
      decimals: poolReserve.decimals,
      isWrappedBaseAsset: poolReserve.isWrappedBaseAsset,
    }

    return (
      <>
        <MoneyMarketAssetInput
          name="supply-amount"
          value={amount}
          onChange={handleChange}
          usdValue={amountInUsd.toString()}
          symbol={
            supplyUnWrapped
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.symbol
          }
          assets={[
            {
              balance: maxAmountToSupply,
              symbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.symbol,
              iconSymbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
              address: poolReserve.underlyingAsset,
            },
          ]}
          isMaxSelected={isMaxSelected}
          disabled={supplyTxState.loading}
          maxValue={maxAmountToSupply}
          sx={{ mb: 20 }}
          error={
            isMaxExceeded ? "Insufficient balance on your account." : undefined
          }
        />

        <Stack separated>
          <Flex>
            <span>Supply APY</span>
            <span>{supplyApy}</span>
          </Flex>
          <Flex>
            <span>Incentives</span>
            <span>
              {
                "incentives={poolReserve.aIncentivesData} symbol={poolReserve.symbol}"
              }
            </span>
          </Flex>
          <Flex>
            <span>Collateral</span>
            <span>{collateralType}</span>
          </Flex>
          <Flex>
            <span>HF</span>
            <span>
              {user.healthFactor} {"->"} {healthFactorAfterDeposit.toString(10)}
            </span>
          </Flex>
        </Stack>

        {/* {txError && <GasEstimationError txError={txError} />} */}
        {showIsolationWarning && (
          <IsolationModeWarning asset={poolReserve.symbol} sx={{ mt: 12 }} />
        )}

        {supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage })}
        {debtCeilingUsage.determineWarningDisplay({
          debtCeiling: debtCeilingUsage,
        })}

        <SupplyActions {...supplyActionsProps} />
      </>
    )
  },
)

SupplyModalContent.displayName = "SupplyModalContent"
