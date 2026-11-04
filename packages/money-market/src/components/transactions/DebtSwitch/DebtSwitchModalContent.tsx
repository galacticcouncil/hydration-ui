import { InterestRate } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { MaxUint256 } from "@ethersproject/constants"
import { Alert, Separator, Stack } from "@galacticcouncil/ui/components"
import { BigNumber } from "bignumber.js"
import { useRef, useState } from "react"

import { Asset, AssetInput } from "@/components/primitives/AssetInput"
import { DebtSwitchActions } from "@/components/transactions/DebtSwitch/DebtSwitchActions"
import { DebtSwitchModalDetails } from "@/components/transactions/DebtSwitch/DebtSwitchModalDetails"
import { SwapAssetSwitcher } from "@/components/transactions/Swap/SwapAssetSwitcher"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedUserReserveData } from "@/hooks/commonTypes"
import { maxInputAmountWithSlippage } from "@/hooks/paraswap/common"
import { useDebtSwitch } from "@/hooks/paraswap/useDebtSwitch"
import { useSwapSlippageSettings } from "@/hooks/paraswap/useSwapRateProvider"
import { ModalArgsType, useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { assetCanBeBorrowedByUser } from "@/utils/getMaxAmountAvailableToBorrow"

enum ErrorType {
  INSUFFICIENT_LIQUIDITY,
}

interface SwitchTargetAsset extends Asset {
  variableApy: string
}

export const DebtSwitchModalContent: React.FC<TxModalWrapperRenderProps> = (
  props,
) => {
  const { reserves, user } = useAppDataContext()
  const { poolReserve } = props

  const switchTargets = reserves
    .filter(
      (r) =>
        r.underlyingAsset !== poolReserve.underlyingAsset &&
        r.availableLiquidity !== "0" &&
        assetCanBeBorrowedByUser(r, user),
    )
    .map<SwitchTargetAsset>((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
      variableApy: reserve.variableBorrowAPY,
      balance:
        user.userReservesData.find(
          (r) => r.underlyingAsset === reserve.underlyingAsset,
        )?.variableBorrows ?? "0",
    }))

  if (!switchTargets.length) {
    return (
      <Alert
        variant="info"
        description="There are no assets you can currently switch this debt to."
      />
    )
  }

  return <DebtSwitchForm {...props} switchTargets={switchTargets} />
}

const DebtSwitchForm: React.FC<
  TxModalWrapperRenderProps & { switchTargets: SwitchTargetAsset[] }
> = ({ poolReserve, userReserve, switchTargets }) => {
  const { user } = useAppDataContext()
  const [currentChainId, currentNetworkConfig] = useRootStore((store) => [
    store.currentChainId,
    store.currentNetworkConfig,
  ])
  const { currentAccount } = useWeb3Context()
  const {
    mainTxState,
    txError,
    setTxError,
    args: modalArgs,
  } = useModalContext()
  const { currentRateMode } = modalArgs as ModalArgsType
  const { swapSlippage } = useSwapSlippageSettings()

  const [_amount, setAmount] = useState("")
  const amountRef = useRef<string>("")
  const [targetReserve, setTargetReserve] = useState<Asset>(switchTargets[0])

  const switchTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address,
  ) as ComputedUserReserveData

  const maxAmountToSwitch = userReserve.variableBorrows

  const isMaxSelected =
    !!_amount && new BigNumber(_amount).gte(maxAmountToSwitch)
  const amount = isMaxSelected ? maxAmountToSwitch : _amount

  const {
    inputAmount,
    outputAmount,
    outputAmountUSD,
    priceImpactPct,
    error,
    loading: routeLoading,
    buildTxFn,
  } = useDebtSwitch({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapOut: { ...poolReserve, amount: amountRef.current },
    swapIn: { ...switchTarget.reserve, amount: "0" },
    max: isMaxSelected,
    skip: mainTxState.loading || false,
    maxSlippage: swapSlippage,
  })

  const loadingSkeleton = routeLoading && outputAmountUSD === "0"

  const handleChange = (value: string) => {
    const maxSelected = !!value && new BigNumber(value).gte(maxAmountToSwitch)
    amountRef.current = maxSelected ? maxAmountToSwitch : value
    setAmount(value)
    setTxError(undefined)
  }

  let availableBorrowCap = valueToBigNumber(MaxUint256.toString())
  let availableLiquidity: string | number = "0"
  availableBorrowCap =
    switchTarget.reserve.borrowCap === "0"
      ? valueToBigNumber(MaxUint256.toString())
      : valueToBigNumber(Number(switchTarget.reserve.borrowCap)).minus(
          valueToBigNumber(switchTarget.reserve.totalDebt),
        )
  availableLiquidity = switchTarget.reserve.formattedAvailableLiquidity

  const availableLiquidityOfTargetReserve = BigNumber.max(
    BigNumber.min(availableLiquidity, availableBorrowCap),
    0,
  )

  const poolReserveAmountUSD = Number(amount) * Number(poolReserve.priceInUSD)
  const targetReserveAmountUSD =
    Number(inputAmount) * Number(switchTarget.reserve.priceInUSD)

  const priceImpactDifference: number =
    targetReserveAmountUSD - poolReserveAmountUSD
  const insufficientCollateral =
    Number(user.availableBorrowsUSD) === 0 ||
    priceImpactDifference > Number(user.availableBorrowsUSD)

  let blockingError: ErrorType | undefined = undefined
  if (new BigNumber(inputAmount).gt(availableLiquidityOfTargetReserve)) {
    blockingError = ErrorType.INSUFFICIENT_LIQUIDITY
  }

  const getBlockingError = () => {
    switch (blockingError) {
      case ErrorType.INSUFFICIENT_LIQUIDITY:
        return "There is not enough liquidity for the target asset to perform the switch. Try lowering the amount."
      default:
        return null
    }
  }

  const maxAmountToReceiveWithSlippage = maxInputAmountWithSlippage(
    inputAmount,
    swapSlippage.toString(),
    switchTarget.reserve.decimals || 18,
  )

  const blockingErrorText = getBlockingError()

  return (
    <>
      <AssetInput
        label="From"
        value={amount}
        onChange={handleChange}
        displayValue={poolReserveAmountUSD.toString()}
        symbol={poolReserve.symbol}
        assets={[
          {
            balance: maxAmountToSwitch,
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        maxButtonBalance={maxAmountToSwitch}
        balanceLabel="Borrow balance"
        isDisabled={mainTxState.loading}
      />

      <SwapAssetSwitcher
        assetInSymbol={targetReserve.symbol}
        assetOutSymbol={poolReserve.symbol}
        priceInUSD={poolReserve.priceInUSD}
        priceOutUSD={switchTarget.reserve.priceInUSD}
      />

      <AssetInput<SwitchTargetAsset>
        label="To"
        value={inputAmount}
        onSelect={setTargetReserve}
        displayValue={targetReserveAmountUSD.toString()}
        symbol={targetReserve.symbol}
        assets={switchTargets}
        balanceLabel="Borrow balance"
        isValueLoading={loadingSkeleton}
        hideMaxBalanceAction
        isReadOnly
      />

      <Separator mx="var(--modal-content-inset)" />

      <DebtSwitchModalDetails
        switchSource={userReserve}
        switchTarget={switchTarget}
        toAmount={inputAmount}
        fromAmount={amount === "" ? "0" : amount}
        loading={loadingSkeleton}
        sourceBalance={maxAmountToSwitch}
        sourceBorrowAPY={poolReserve.variableBorrowAPY}
        targetBorrowAPY={switchTarget.reserve.variableBorrowAPY}
        priceImpactPct={priceImpactPct}
      />

      {(txError || insufficientCollateral || blockingErrorText) && (
        <Stack gap="m" py="m">
          {txError && (
            <Alert variant="error" description={txError.rawError.message} />
          )}
          {insufficientCollateral && (
            <Alert
              variant="error"
              description="Insufficient collateral to cover new borrow position. Wallet must have borrowing power remaining to perform debt switch."
            />
          )}
          {blockingErrorText && (
            <Alert variant="error" description={blockingErrorText} />
          )}
        </Stack>
      )}

      <DebtSwitchActions
        isMaxSelected={isMaxSelected}
        poolReserve={poolReserve}
        amountToSwap={outputAmount}
        amountToReceive={maxAmountToReceiveWithSlippage}
        targetReserve={switchTarget.reserve}
        currentRateMode={currentRateMode ?? InterestRate.Variable}
        symbol={poolReserve.symbol}
        blocked={
          blockingError !== undefined || error !== "" || insufficientCollateral
        }
        loading={routeLoading}
        buildTxFn={buildTxFn}
      />
    </>
  )
}
