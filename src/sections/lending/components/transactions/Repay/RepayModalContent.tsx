import {
  API_ETH_MOCK_ADDRESS,
  InterestRate,
  synthetixProxyByChainId,
} from "@aave/contract-helpers"
import {
  BigNumberValue,
  USD_DECIMALS,
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils"

import BigNumber from "bignumber.js"
import { useEffect, useRef, useState } from "react"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { Alert } from "components/Alert"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { Asset, AssetInput } from "sections/lending/ui/transactions/AssetInput"
import { RepayActions } from "./RepayActions"
import { useShallow } from "hooks/useShallow"

interface RepayAsset extends Asset {
  balance: string
}

export const RepayModalContent = ({
  poolReserve,
  userReserve,
  symbol: modalSymbol,
  tokenBalance,
  nativeBalance,
  isWrongNetwork,
  debtType,
}: ModalWrapperProps & { debtType: InterestRate }) => {
  const { mainTxState: repayTxState, txError } = useModalContext()
  const { marketReferencePriceInUsd, user } = useAppDataContext()
  const { currentChainId, currentMarketData, currentMarket } =
    useProtocolDataContext()

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore(
    useShallow((store) => [
      store.poolComputed.minRemainingBaseTokenBalance,
      store.displayGho,
    ]),
  )

  // states
  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    iconSymbol: poolReserve.iconSymbol,
    balance: tokenBalance,
  })
  const [assets, setAssets] = useState<RepayAsset[]>([tokenToRepayWith])
  const [repayMax, setRepayMax] = useState("")
  const [_amount, setAmount] = useState("")
  const amountRef = useRef<string>()

  const networkConfig = getNetworkConfig(currentChainId)

  const { underlyingBalance, usageAsCollateralEnabledOnUser, reserve } =
    userReserve

  const repayWithATokens =
    tokenToRepayWith.address === poolReserve.aTokenAddress

  const debt =
    debtType === InterestRate.Stable
      ? userReserve?.stableBorrows || "0"
      : userReserve?.variableBorrows || "0"
  const debtUSD = new BigNumber(debt)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)

  const safeAmountToRepayAll = valueToBigNumber(debt)
    .multipliedBy("1.0025")
    .decimalPlaces(poolReserve.decimals, BigNumber.ROUND_UP)

  // calculate max amount abailable to repay
  let maxAmountToRepay: BigNumber
  let balance: string
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(underlyingBalance, debt)
    balance = underlyingBalance
  } else {
    const normalizedWalletBalance = valueToBigNumber(
      tokenToRepayWith.balance,
    ).minus(
      userReserve?.reserve.symbol.toUpperCase() ===
        networkConfig.baseAssetSymbol
        ? minRemainingBaseTokenBalance
        : "0",
    )
    balance = normalizedWalletBalance.toString(10)
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt)
  }

  const isMaxSelected = _amount === "-1"
  const amount = isMaxSelected ? maxAmountToRepay.toString(10) : _amount
  const isMaxExceeded =
    !!amount && BigNumber(amount).gt(maxAmountToRepay.toString(10))

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? maxAmountToRepay.toString(10) : value
    setAmount(value)
    if (maxSelected && (repayWithATokens || maxAmountToRepay.eq(debt))) {
      if (
        tokenToRepayWith.address === API_ETH_MOCK_ADDRESS.toLowerCase() ||
        (synthetixProxyByChainId[currentChainId] &&
          synthetixProxyByChainId[currentChainId].toLowerCase() ===
            reserve.underlyingAsset.toLowerCase())
      ) {
        // for native token and synthetix (only mainnet) we can't send -1 as
        // contract does not accept max unit256
        setRepayMax(safeAmountToRepayAll.toString(10))
      } else {
        // -1 can always be used for v3 otherwise
        // for v2 we can onl use -1 when user has more balance than max debt to repay
        // this is accounted for when maxAmountToRepay.eq(debt) as maxAmountToRepay is
        // min between debt and walletbalance, so if it enters here for v2 it means
        // balance is bigger and will be able to transact with -1
        setRepayMax("-1")
      }
    } else {
      setRepayMax(
        safeAmountToRepayAll.lt(balance)
          ? safeAmountToRepayAll.toString(10)
          : maxAmountToRepay.toString(10),
      )
    }
  }

  // token info
  useEffect(() => {
    const repayTokens: RepayAsset[] = []
    // set possible repay tokens
    // if wrapped reserve push both wrapped / native
    if (poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol) {
      const nativeTokenWalletBalance = valueToBigNumber(nativeBalance)
      const maxNativeToken = BigNumber.max(
        nativeTokenWalletBalance,
        BigNumber.min(nativeTokenWalletBalance, debt),
      )
      repayTokens.push({
        address: API_ETH_MOCK_ADDRESS.toLowerCase(),
        symbol: networkConfig.baseAssetSymbol,
        balance: maxNativeToken.toString(10),
      })
    }
    // push reserve asset
    const minReserveTokenRepay = BigNumber.min(
      valueToBigNumber(tokenBalance),
      debt,
    )
    const maxReserveTokenForRepay = BigNumber.max(
      minReserveTokenRepay,
      tokenBalance,
    )
    repayTokens.push({
      address: poolReserve.underlyingAsset,
      symbol: poolReserve.symbol,
      iconSymbol: poolReserve.iconSymbol,
      balance: maxReserveTokenForRepay.toString(10),
    })
    // push reserve aToken
    if (
      currentMarketData.v3 &&
      !displayGho({ symbol: poolReserve.symbol, currentMarket })
    ) {
      const aTokenBalance = valueToBigNumber(underlyingBalance)
      const maxBalance = BigNumber.max(
        aTokenBalance,
        BigNumber.min(aTokenBalance, debt).toString(10),
      )
      repayTokens.push({
        address: poolReserve.underlyingAsset,
        symbol: `a${poolReserve.symbol}`,
        iconSymbol: poolReserve.iconSymbol,
        aToken: true,
        balance: maxBalance.toString(10),
      })
    }
    setAssets(repayTokens)
    setTokenToRepayWith(repayTokens[0])
  }, [
    currentMarket,
    currentMarketData.v3,
    debt,
    displayGho,
    nativeBalance,
    networkConfig.baseAssetSymbol,
    networkConfig.wrappedBaseAssetSymbol,
    poolReserve.aTokenAddress,
    poolReserve.iconSymbol,
    poolReserve.symbol,
    poolReserve.underlyingAsset,
    tokenBalance,
    underlyingBalance,
  ])

  // debt remaining after repay
  const amountAfterRepay = valueToBigNumber(debt)
    .minus(amount || "0")
    .toString(10)
  const amountAfterRepayInUsd = new BigNumber(amountAfterRepay)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)

  const maxRepayWithDustRemaining =
    isMaxSelected && amountAfterRepayInUsd.toNumber() > 0

  // health factor calculations
  // we use usd values instead of MarketreferenceCurrency so it has same precision
  let newHF = user?.healthFactor
  if (amount) {
    let collateralBalanceMarketReferenceCurrency: BigNumberValue =
      user?.totalCollateralUSD || "0"
    if (repayWithATokens && usageAsCollateralEnabledOnUser) {
      collateralBalanceMarketReferenceCurrency = valueToBigNumber(
        user?.totalCollateralUSD || "0",
      ).minus(valueToBigNumber(reserve.priceInUSD).multipliedBy(amount))
    }

    const remainingBorrowBalance = valueToBigNumber(
      user?.totalBorrowsUSD || "0",
    ).minus(valueToBigNumber(reserve.priceInUSD).multipliedBy(amount))
    const borrowBalanceMarketReferenceCurrency = BigNumber.max(
      remainingBorrowBalance,
      0,
    )

    const calculatedHealthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency,
      borrowBalanceMarketReferenceCurrency,
      currentLiquidationThreshold: user?.currentLiquidationThreshold || "0",
    })

    newHF =
      calculatedHealthFactor.isLessThan(0) && !calculatedHealthFactor.eq(-1)
        ? "0"
        : calculatedHealthFactor.toString(10)
  }

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(reserve.priceInUSD)

  if (repayTxState.success)
    return (
      <TxSuccessView
        action={<span>repaid</span>}
        amount={amountRef.current}
        symbol={repayWithATokens ? poolReserve.symbol : tokenToRepayWith.symbol}
      />
    )

  return (
    <>
      <AssetInput
        name="repay-amount"
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        symbol={tokenToRepayWith.symbol}
        assets={assets}
        onSelect={setTokenToRepayWith}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToRepay.toString(10)}
        sx={{ mb: 20 }}
        error={isMaxExceeded ? "Remaining debt exceeded" : undefined}
      />

      {maxRepayWithDustRemaining && (
        <Alert variant="warning" sx={{ mb: 20 }}>
          You don&apos;t have enough funds in your wallet to repay the full
          amount. If you proceed to repay with your current amount of funds, you
          will still have a small borrowing position in your dashboard.
        </Alert>
      )}

      <TxModalDetails>
        <DetailsNumberLineWithSub
          description={<span>Remaining debt</span>}
          futureValue={amountAfterRepay}
          futureValueUSD={amountAfterRepayInUsd.toString(10)}
          value={debt}
          valueUSD={debtUSD.toString()}
          symbol={
            poolReserve.iconSymbol === networkConfig.wrappedBaseAssetSymbol
              ? networkConfig.baseAssetSymbol
              : poolReserve.iconSymbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={newHF}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <RepayActions
        maxApproveNeeded={safeAmountToRepayAll.toString()}
        poolReserve={poolReserve}
        amountToRepay={isMaxSelected ? repayMax : amount}
        poolAddress={
          repayWithATokens
            ? poolReserve.underlyingAsset
            : tokenToRepayWith.address ?? ""
        }
        isWrongNetwork={isWrongNetwork}
        symbol={modalSymbol}
        debtType={debtType}
        repayWithATokens={repayWithATokens}
        blocked={isMaxExceeded}
      />
    </>
  )
}
