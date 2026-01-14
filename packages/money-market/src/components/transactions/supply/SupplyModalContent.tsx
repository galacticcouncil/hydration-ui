import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
} from "@aave/math-utils"
import { Separator, Stack, SummaryRow } from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import { Big } from "big.js"
import React, { useMemo, useState } from "react"

import { AssetInput } from "@/components/primitives/AssetInput"
import { CollateralState } from "@/components/primitives/CollateralState"
import { HealthFactorChange } from "@/components/primitives/HealthFactorChange"
import { IncentivesButton } from "@/components/primitives/IncentivesButton"
import { ValueDetail } from "@/components/primitives/ValueDetail"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { IsolationModeWarning } from "@/components/warnings/IsolationModeWarning"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
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
    nativeBalance,
    tokenBalance,
  }: TxModalWrapperRenderProps) => {
    const { formatPercent } = useAppFormatters()

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
      : Big(-1)

    const liquidationThresholdAfter =
      user && totalCollateralMarketReferenceCurrencyAfter.gt(0)
        ? Big(user.totalCollateralMarketReferenceCurrency)
            .mul(user.currentLiquidationThreshold)
            .plus(
              amountIntEth.mul(
                poolReserve.formattedReserveLiquidationThreshold,
              ),
            )
            .div(totalCollateralMarketReferenceCurrencyAfter)
        : "-1"

    const isMaxExceeded = !!amount && Big(amount).gt(maxAmountToSupply)

    let healthFactorAfterDeposit = user ? user.healthFactor : "-1"

    if (
      user &&
      ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
        (user.isInIsolationMode &&
          user.isolatedReserve?.underlyingAsset ===
            poolReserve.underlyingAsset))
    ) {
      healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: Big(
          totalCollateralMarketReferenceCurrencyAfter,
        ).toString(),
        borrowBalanceMarketReferenceCurrency: Big(
          user.totalBorrowsMarketReferenceCurrency,
        ).toString(),
        currentLiquidationThreshold: Big(liquidationThresholdAfter).toString(),
      }).toString()
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

    const healthFactor = user ? user.healthFactor : "-1"
    const futureHealthFactor = healthFactorAfterDeposit.toString()

    const shouldRenderHealthFactor =
      healthFactor !== "-1" && futureHealthFactor !== "-1"

    const incentives = poolReserve.aIncentivesData
    const shouldRenderIncentives =
      incentives && incentives.filter((i) => i.incentiveAPR !== "0").length > 0

    const supplyCapWarning = supplyCapUsage.determineWarningDisplay({
      supplyCap: supplyCapUsage,
    })

    const debptCeilingWarning = debtCeilingUsage.determineWarningDisplay({
      debtCeiling: debtCeilingUsage,
    })

    const shouldRenderWarnings =
      showIsolationWarning || !!supplyCapWarning || !!debptCeilingWarning

    return (
      <>
        <AssetInput
          value={amount}
          onChange={handleChange}
          displayValue={amountInUsd.toString()}
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
          disabled={supplyTxState.loading}
          maxButtonBalance={maxAmountToSupply}
          amountError={
            isMaxExceeded ? "Insufficient balance on your account." : undefined
          }
        />

        <Separator mx="var(--modal-content-inset)" />

        <Stack
          separated
          separator={<Separator mx="var(--modal-content-inset)" />}
          withTrailingSeparator
        >
          <SummaryRow
            label="Supply APY"
            content={
              <ValueDetail value={formatPercent(Number(supplyApy) * 100)} />
            }
          />
          {shouldRenderIncentives && (
            <SummaryRow
              label="Incentives"
              content={
                <IncentivesButton
                  incentives={incentives}
                  symbol={poolReserve.symbol}
                />
              }
            />
          )}
          <SummaryRow
            label="Collateral"
            content={<CollateralState collateralType={collateralType} />}
          />
          {shouldRenderHealthFactor && (
            <SummaryRow
              label="Health Factor"
              content={
                <HealthFactorChange
                  healthFactor={healthFactor}
                  futureHealthFactor={futureHealthFactor}
                />
              }
            />
          )}

          {shouldRenderWarnings && (
            <Stack gap={14} py={14}>
              {showIsolationWarning && (
                <IsolationModeWarning asset={poolReserve.symbol} />
              )}
              {supplyCapWarning}
              {debptCeilingWarning}
            </Stack>
          )}
        </Stack>

        {/* {showIsolationWarning && (
          <IsolationModeWarning asset={poolReserve.symbol} />
        )}
        {supplyCapUsage.determineWarningDisplay({
          supplyCap: supplyCapUsage,
        })}
        {debtCeilingUsage.determineWarningDisplay({
          debtCeiling: debtCeilingUsage,
        })} */}

        <SupplyActions {...supplyActionsProps} />
      </>
    )
  },
)

SupplyModalContent.displayName = "SupplyModalContent"
