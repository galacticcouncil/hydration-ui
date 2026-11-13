import { Alert, Separator, Stack } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { BigNumber } from "bignumber.js"
import { useRef, useState } from "react"

import { Asset, AssetInput } from "@/components/primitives/AssetInput"
import { SwapActions } from "@/components/transactions/Swap/SwapActions"
import { SwapAssetSwitcher } from "@/components/transactions/Swap/SwapAssetSwitcher"
import { SwapModalDetails } from "@/components/transactions/Swap/SwapModalDetails"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { CollateralType } from "@/helpers/types"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedUserReserveData } from "@/hooks/commonTypes"
import { useCollateralSwap } from "@/hooks/paraswap/useCollateralSwap"
import { useSwapSlippageSettings } from "@/hooks/paraswap/useSwapRateProvider"
import { getDebtCeilingData } from "@/hooks/useAssetCaps"
import { useModalContext } from "@/hooks/useModal"
import { useRootStore } from "@/store/root"
import { isGho } from "@/utils"
import { remainingCap } from "@/utils/getMaxAmountAvailableToSupply"
import { calculateHFAfterSwap } from "@/utils/hfUtils"
import {
  ErrorType,
  getAssetCollateralType,
  useFlashloan,
  zeroLTVBlockingWithdraw,
} from "@/utils/transactions"
import { amountToUsd } from "@/utils/utils"

export const SwapModalContent: React.FC<TxModalWrapperRenderProps> = (
  props,
) => {
  const { reserves, user } = useAppDataContext()
  const { poolReserve } = props

  const swapTargets = reserves
    .filter(
      (r) =>
        !isGho(r) &&
        r.underlyingAsset !== poolReserve.underlyingAsset &&
        !r.isFrozen,
    )
    .map((reserve) => {
      const targetUserReserve = user.userReservesData.find(
        (r) => r.underlyingAsset === reserve.underlyingAsset,
      )
      return {
        address: reserve.underlyingAsset,
        symbol: reserve.symbol,
        iconSymbol: reserve.iconSymbol,
        balance: targetUserReserve?.underlyingBalance ?? "0",
      }
    })

  if (!swapTargets.length) {
    return (
      <Alert
        variant="info"
        description="There are no assets you can currently swap this supply to."
      />
    )
  }

  return <SwapForm {...props} swapTargets={swapTargets} />
}

const SwapForm: React.FC<
  TxModalWrapperRenderProps & { swapTargets: Asset[] }
> = ({ poolReserve, userReserve, swapTargets }) => {
  const { marketReferencePriceInUsd, user } = useAppDataContext()
  const [currentChainId, currentNetworkConfig] = useRootStore((store) => [
    store.currentChainId,
    store.currentNetworkConfig,
  ])
  const { account } = useAccount()
  const { mainTxState: swapTxState, txError } = useModalContext()
  const { swapSlippage } = useSwapSlippageSettings()

  const [_amount, setAmount] = useState("")
  const amountRef = useRef<string>("")
  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0])

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address,
  ) as ComputedUserReserveData

  // Capped below available liquidity, otherwise the withdraw step of the swap fails.
  const maxAmountToSwap = BigNumber.min(
    userReserve.underlyingBalance,
    new BigNumber(poolReserve.availableLiquidity).multipliedBy(0.99),
  ).toString(10)

  const isMaxSelected = !!_amount && new BigNumber(_amount).gte(maxAmountToSwap)
  const amount = isMaxSelected ? maxAmountToSwap : _amount

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    priceImpactPct,
    error,
    loading,
    submitTxFn,
  } = useCollateralSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: account?.address ?? "",
    swapIn: { ...poolReserve, amount: amountRef.current },
    swapOut: { ...swapTarget.reserve, amount: "0" },
    max: isMaxSelected,
    skip: swapTxState.loading || false,
    maxSlippage: swapSlippage,
  })

  const handleChange = (value: string) => {
    const maxSelected = !!value && new BigNumber(value).gte(maxAmountToSwap)
    amountRef.current = maxSelected ? maxAmountToSwap : value
    setAmount(value)
  }

  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterSwap({
    fromAmount: amount,
    fromAssetData: poolReserve,
    fromAssetUserData: userReserve,
    user,
    toAmountAfterSlippage: outputAmount,
    toAssetData: swapTarget.reserve,
  })

  // A flashloan avoids liquidation when the swap would briefly drop HF below 1.
  const shouldUseFlashloan = useFlashloan(
    user.healthFactor,
    hfEffectOfFromAmount,
  )

  // The supply cap can only be checked after quoting, it depends on the swap output.
  const remainingSupplyCap = remainingCap(
    swapTarget.reserve.supplyCap,
    swapTarget.reserve.totalLiquidity,
  )
  const remainingCapUsd = amountToUsd(
    remainingSupplyCap,
    swapTarget.reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  )

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user)

  let blockingError: ErrorType | undefined = undefined
  if (
    assetsBlockingWithdraw.length > 0 &&
    !assetsBlockingWithdraw.includes(poolReserve.symbol)
  ) {
    blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED
  } else if (
    !remainingSupplyCap.eq("-1") &&
    remainingCapUsd.lt(outputAmountUSD)
  ) {
    blockingError = ErrorType.SUPPLY_CAP_REACHED
  } else if (shouldUseFlashloan && !poolReserve.flashLoanEnabled) {
    blockingError = ErrorType.FLASH_LOAN_NOT_AVAILABLE
  }

  const getBlockingError = () => {
    switch (blockingError) {
      case ErrorType.SUPPLY_CAP_REACHED:
        return "Supply cap on target reserve reached. Try lowering the amount."
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return `Assets with zero LTV (${assetsBlockingWithdraw.join(
          ", ",
        )}) must be withdrawn or disabled as collateral to perform this action`
      case ErrorType.FLASH_LOAN_NOT_AVAILABLE:
        return "Due to health factor impact, a flashloan is required to perform this transaction, but flashloan availability is disabled for this asset. Try lowering the amount or supplying additional collateral."
      default:
        return null
    }
  }

  // HF is only relevant when there are borrows.
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== "0" &&
    poolReserve.reserveLiquidationThreshold !== "0"

  const { debtCeilingReached: sourceDebtCeiling } = getDebtCeilingData(
    swapTarget.reserve,
  )
  const swapSourceCollateralType = getAssetCollateralType(
    userReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    sourceDebtCeiling,
  )

  const { debtCeilingReached: targetDebtCeiling } = getDebtCeilingData(
    swapTarget.reserve,
  )
  let swapTargetCollateralType = getAssetCollateralType(
    swapTarget,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    targetDebtCeiling,
  )

  // If the user is swapping all of their isolated asset to an asset that is not supplied,
  // then the swap target will be enabled as collateral as part of the swap.
  if (
    isMaxSelected &&
    swapSourceCollateralType === CollateralType.ISOLATED_ENABLED &&
    swapTarget.underlyingBalance === "0"
  ) {
    if (swapTarget.reserve.isIsolated) {
      swapTargetCollateralType = CollateralType.ISOLATED_ENABLED
    } else {
      swapTargetCollateralType = CollateralType.ENABLED
    }
  }

  // If the user is swapping all of their enabled asset to an isolated asset that is not supplied,
  // and no other supplied assets are being used as collateral,
  // then the swap target will be enabled as collateral and the user will be in isolation mode.
  if (
    isMaxSelected &&
    swapSourceCollateralType === CollateralType.ENABLED &&
    swapTarget.underlyingBalance === "0" &&
    swapTarget.reserve.isIsolated
  ) {
    const reservesAsCollateral = user.userReservesData.filter(
      (r) => r.usageAsCollateralEnabledOnUser,
    )

    if (
      reservesAsCollateral.length === 1 &&
      reservesAsCollateral[0].underlyingAsset === userReserve.underlyingAsset
    ) {
      swapTargetCollateralType = CollateralType.ISOLATED_ENABLED
    }
  }

  const blockingErrorText = getBlockingError()

  return (
    <>
      <AssetInput
        label="From"
        value={amount}
        onChange={handleChange}
        displayValue={inputAmountUSD}
        symbol={poolReserve.symbol}
        assets={[
          {
            balance: maxAmountToSwap,
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        maxButtonBalance={maxAmountToSwap}
        balanceLabel="Supply balance"
        isDisabled={swapTxState.loading}
      />

      <SwapAssetSwitcher
        assetInSymbol={targetReserve.symbol}
        assetOutSymbol={poolReserve.symbol}
        priceInUSD={poolReserve.priceInUSD}
        priceOutUSD={swapTarget.reserve.priceInUSD}
      />

      <AssetInput
        label="To"
        value={outputAmount}
        onSelect={setTargetReserve}
        displayValue={outputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        isValueLoading={loading}
        balanceLabel="Supply balance"
        hideMaxBalanceAction
        isReadOnly
      />

      <Separator mx="var(--modal-content-inset)" />

      <SwapModalDetails
        showHealthFactor={!!showHealthFactor}
        healthFactor={user.healthFactor}
        healthFactorAfterSwap={hfAfterSwap.toString()}
        swapSource={{
          ...userReserve,
          collateralType: swapSourceCollateralType,
        }}
        swapTarget={{ ...swapTarget, collateralType: swapTargetCollateralType }}
        toAmount={outputAmount}
        fromAmount={amount === "" ? "0" : amount}
        priceImpactPct={priceImpactPct}
        loading={loading}
      />

      {(txError || blockingErrorText || (error && !loading)) && (
        <Stack gap="m" py="m">
          {error && !loading && <Alert variant="error" description={error} />}
          {txError && (
            <Alert variant="error" description={txError.rawError.message} />
          )}
          {blockingErrorText && (
            <Alert variant="error" description={blockingErrorText} />
          )}
        </Stack>
      )}

      <SwapActions
        amountToSwap={inputAmount}
        blocked={
          blockingError !== undefined ||
          error !== "" ||
          swapTarget.reserve.symbol === "stETH"
        }
        loading={loading}
        submitTxFn={submitTxFn}
      />
    </>
  )
}
