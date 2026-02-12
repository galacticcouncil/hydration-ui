import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"

import BigNumber from "bignumber.js"
import React, { useMemo, useState } from "react"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsCollateralLine,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { getAssetCollateralType } from "sections/lending/components/transactions/utils"
import { IsolationModeWarning } from "sections/lending/components/transactions/Warnings/IsolationModeWarning"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { ERC20TokenType } from "sections/lending/libs/web3-data-provider/Web3Provider"
import { useRootStore } from "sections/lending/store/root"
import { AssetInput } from "sections/lending/ui/transactions/AssetInput"
import { getMaxAmountAvailableToSupply } from "sections/lending/utils/getMaxAmountAvailableToSupply"
import { roundToTokenDecimals } from "sections/lending/utils/utils"
import { SupplyActions } from "./SupplyActions"
import { PRIME_APY } from "api/borrow"
import { PRIME_ASSET_ID } from "utils/constants"
import { getAssetIdFromAddress } from "utils/evm"
import { DisableCollaterasButton } from "./DisableCollateras"

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
  }: ModalWrapperProps) => {
    const { marketReferencePriceInUsd, user } = useAppDataContext()
    const { currentNetworkConfig } = useProtocolDataContext()
    const { mainTxState: supplyTxState, txError } = useModalContext()
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
    const isIsolated = poolReserve.isIsolated
    const isPrimeAsset =
      PRIME_ASSET_ID === getAssetIdFromAddress(poolReserve.underlyingAsset)

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

    const { activeCollaterals, isBorrowedAssets, isActiveCollaterals } =
      useMemo(() => {
        const activeCollaterals = isIsolated
          ? user.userReservesData.filter(
              (reserve) => reserve.usageAsCollateralEnabledOnUser,
            )
          : []

        const isBorrowedAssets = user.debtAPY > 0

        const isActiveCollaterals = activeCollaterals.length > 0

        return { activeCollaterals, isBorrowedAssets, isActiveCollaterals }
      }, [user.userReservesData, user.debtAPY, isIsolated])

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
    const amountIntEth = new BigNumber(amount).multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency,
    )
    // TODO: is it correct to ut to -1 if user doesnt exist?
    const amountInUsd = amountIntEth
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS)
    const totalCollateralMarketReferenceCurrencyAfter = user
      ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(
          amountIntEth,
        )
      : "-1"

    const liquidationThresholdAfter = user
      ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
          .multipliedBy(user.currentLiquidationThreshold)
          .plus(
            amountIntEth.multipliedBy(
              poolReserve.formattedReserveLiquidationThreshold,
            ),
          )
          .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
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
        collateralBalanceMarketReferenceCurrency:
          totalCollateralMarketReferenceCurrencyAfter,
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
          user.totalBorrowsMarketReferenceCurrency,
        ),
        currentLiquidationThreshold: liquidationThresholdAfter,
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

    // token info to add to wallet
    const addToken: ERC20TokenType = {
      address: poolReserve.aTokenAddress,
      symbol: poolReserve.iconSymbol,
      decimals: poolReserve.decimals,
      aToken: true,
    }

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
      blocked: isMaxExceeded || isActiveCollaterals,
      decimals: poolReserve.decimals,
      isWrappedBaseAsset: poolReserve.isWrappedBaseAsset,
      isIsolated,
    }

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action={<span>Supplied</span>}
          amount={amount}
          symbol={
            supplyUnWrapped
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.symbol
          }
          addToken={addToken}
        />
      )

    return (
      <>
        <AssetInput
          name="supply-amount"
          value={amount}
          onChange={handleChange}
          usdValue={amountInUsd.toString(10)}
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

        <TxModalDetails>
          <DetailsNumberLine
            description={<span>Supply APY</span>}
            value={supplyApy}
            percent
          />
          <DetailsIncentivesLine
            incentives={poolReserve.aIncentivesData}
            symbol={poolReserve.symbol}
          />
          {isPrimeAsset && (
            <DetailsNumberLine
              description={<span>PRIME APY</span>}
              value={PRIME_APY.toString()}
              percent
            />
          )}
          <DetailsCollateralLine collateralType={collateralType} />
          <DetailsHFLine
            visibleHfChange={!!amount}
            healthFactor={user ? user.healthFactor : "-1"}
            futureHealthFactor={healthFactorAfterDeposit.toString(10)}
          />
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}
        {showIsolationWarning && (
          <IsolationModeWarning asset={poolReserve.symbol} sx={{ mt: 12 }} />
        )}

        {supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage })}
        {debtCeilingUsage.determineWarningDisplay({
          debtCeiling: debtCeilingUsage,
        })}

        {isIsolated && isActiveCollaterals && (
          <DisableCollaterasButton
            activeCollaterals={activeCollaterals}
            isBorrowedAssets={isBorrowedAssets}
          />
        )}
        <SupplyActions {...supplyActionsProps} />
      </>
    )
  },
)
