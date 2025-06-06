import {
  API_ETH_MOCK_ADDRESS,
  InterestRate,
  synthetixProxyByChainId,
} from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
} from "@aave/math-utils"
import {
  Alert,
  Separator,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { bigMax, bigShift } from "@galacticcouncil/utils"
import Big, { BigSource } from "big.js"
import BigNumber from "bignumber.js"
import { useEffect, useRef, useState } from "react"

import { Asset, AssetInput, HealthFactorChange } from "@/components/primitives"
import { ValueDetail } from "@/components/primitives/ValueDetail"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"
import { getNetworkConfig } from "@/utils/marketsAndNetworksConfig"

import { RepayActions } from "./RepayActions"

interface RepayAsset extends Asset {
  balance: string
}

export const RepayModalContent: React.FC<
  TxModalWrapperRenderProps & { debtType: InterestRate }
> = ({
  poolReserve,
  userReserve,
  symbol: modalSymbol,
  tokenBalance,
  nativeBalance,
  isWrongNetwork,
  debtType,
}) => {
  const { formatCurrency } = useAppFormatters()
  const { marketReferencePriceInUsd, user } = useAppDataContext()
  const { currentChainId, currentMarketData, currentMarket } =
    useProtocolDataContext()

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore((store) => [
    store.poolComputed.minRemainingBaseTokenBalance,
    store.displayGho,
  ])

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

  const safeAmountToRepayAll = Big(debt)
    .mul("1.0025")
    .round(poolReserve.decimals, BigNumber.ROUND_UP)

  // calculate max amount abailable to repay
  let maxAmountToRepay: BigNumber
  let balance: string
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(underlyingBalance, debt)
    balance = underlyingBalance
  } else {
    const normalizedWalletBalance = Big(tokenToRepayWith.balance).minus(
      userReserve?.reserve.symbol.toUpperCase() ===
        networkConfig.baseAssetSymbol
        ? minRemainingBaseTokenBalance
        : "0",
    )
    balance = normalizedWalletBalance.toString()
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt)
  }

  const isMaxSelected = _amount === "-1"
  const amount = isMaxSelected ? maxAmountToRepay.toString() : _amount
  const isMaxExceeded =
    !!amount && BigNumber(amount).gt(maxAmountToRepay.toString())

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? maxAmountToRepay.toString() : value
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
        setRepayMax(safeAmountToRepayAll.toString())
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
          ? safeAmountToRepayAll.toString()
          : maxAmountToRepay.toString(),
      )
    }
  }

  // token info
  useEffect(() => {
    const repayTokens: RepayAsset[] = []

    // push reserve asset
    const minReserveTokenRepay = BigNumber.min(Big(tokenBalance), debt)
    const maxReserveTokenForRepay = BigNumber.max(
      minReserveTokenRepay,
      tokenBalance,
    )
    repayTokens.push({
      address: poolReserve.underlyingAsset,
      symbol: poolReserve.symbol,
      iconSymbol: poolReserve.iconSymbol,
      balance: maxReserveTokenForRepay.toString(),
    })
    // push reserve aToken
    if (
      currentMarketData.v3 &&
      !displayGho({ symbol: poolReserve.symbol, currentMarket })
    ) {
      const aTokenBalance = Big(underlyingBalance)
      const maxBalance = BigNumber.max(
        aTokenBalance,
        BigNumber.min(aTokenBalance, debt).toString(),
      )
      repayTokens.push({
        address: poolReserve.underlyingAsset,
        symbol: `a${poolReserve.symbol}`,
        iconSymbol: poolReserve.iconSymbol,
        aToken: true,
        balance: maxBalance.toString(),
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
    poolReserve.aTokenAddress,
    poolReserve.iconSymbol,
    poolReserve.symbol,
    poolReserve.underlyingAsset,
    tokenBalance,
    underlyingBalance,
  ])

  // debt remaining after repay
  const amountAfterRepay = Big(debt)
    .minus(amount || "0")
    .toString()
  const amountAfterRepayInUsd = bigShift(
    Big(amountAfterRepay)
      .mul(poolReserve.formattedPriceInMarketReferenceCurrency)
      .mul(marketReferencePriceInUsd),
    -USD_DECIMALS,
  )

  const maxRepayWithDustRemaining =
    isMaxSelected && amountAfterRepayInUsd.toNumber() > 0

  // health factor calculations
  // we use usd values instead of MarketreferenceCurrency so it has same precision
  let newHF = user?.healthFactor
  if (amount) {
    let collateralBalanceMarketReferenceCurrency: BigSource =
      user?.totalCollateralUSD || "0"
    if (repayWithATokens && usageAsCollateralEnabledOnUser) {
      collateralBalanceMarketReferenceCurrency = Big(
        user?.totalCollateralUSD || "0",
      ).minus(Big(reserve.priceInUSD).mul(amount))
    }

    const remainingBorrowBalance = Big(user?.totalBorrowsUSD || "0").minus(
      Big(reserve.priceInUSD).mul(amount),
    )
    const borrowBalanceMarketReferenceCurrency = bigMax(
      remainingBorrowBalance,
      0,
    )

    const calculatedHealthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency:
        collateralBalanceMarketReferenceCurrency.toString(),
      borrowBalanceMarketReferenceCurrency:
        borrowBalanceMarketReferenceCurrency.toString(),
      currentLiquidationThreshold: user?.currentLiquidationThreshold || "0",
    })

    newHF =
      calculatedHealthFactor.isLessThan(0) && !calculatedHealthFactor.eq(-1)
        ? "0"
        : calculatedHealthFactor.toString()
  }

  // calculating input usd value
  const usdValue = Big(amount || 0).mul(reserve.priceInUSD)

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = newHF.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  return (
    <>
      <AssetInput
        name="repay-amount"
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString()}
        symbol={tokenToRepayWith.symbol}
        assets={assets}
        onSelect={setTokenToRepayWith}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToRepay.toString()}
        error={isMaxExceeded ? "Remaining debt exceeded" : undefined}
      />

      <Separator mx="var(--modal-content-inset)" />

      <Stack
        separated
        separator={<Separator mx="var(--modal-content-inset)" />}
        withTrailingSeparator
      >
        <SummaryRow
          label="Remaining debt"
          content={
            <ValueDetail
              align="flex-end"
              value={formatCurrency(amountAfterRepay, {
                symbol: poolReserve.symbol,
              })}
              subValue={formatCurrency(amountAfterRepayInUsd.toString())}
            />
          }
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
        {maxRepayWithDustRemaining && (
          <Alert
            sx={{ my: 14 }}
            variant="warning"
            description="You don't have enough funds in your wallet to repay the full amount. If you proceed to repay with your current amount of funds, you will still have a small borrowing position in your dashboard."
          />
        )}
      </Stack>

      <RepayActions
        maxApproveNeeded={safeAmountToRepayAll.toString()}
        poolReserve={poolReserve}
        amountToRepay={isMaxSelected ? repayMax : amount}
        poolAddress={
          repayWithATokens
            ? poolReserve.underlyingAsset
            : (tokenToRepayWith.address ?? "")
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
