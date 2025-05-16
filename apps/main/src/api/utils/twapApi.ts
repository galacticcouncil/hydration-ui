import { Humanizer, Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import Big from "big.js"

import { getTradeMaxAmountIn, getTradeMinAmountOut } from "@/api/utils/slippage"
import { TradeApi } from "@/api/utils/tradeApi"
import { TAsset } from "@/providers/assetsProvider"
import { AnyPapiTx } from "@/states/transactions"
import { HOUR_MS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

const TWAP_BLOCK_PERIOD = 6
const TWAP_MAX_PRICE_IMPACT = -5
const TWAP_MAX_DURATION = 6 * HOUR_MS
const TWAP_TX_MULTIPLIER = 3

export interface TwapOrder extends Humanizer {
  readonly amountInPerTrade: bigint
  readonly amountIn: bigint
  readonly amountOut: bigint
  readonly maxAmountIn: bigint
  readonly minAmountOut: bigint
  readonly priceImpactPct: number
  readonly reps: number
  readonly time: number
  readonly tradeFee: bigint
  readonly error: TwapError | null
  estimateFee(txfee: bigint): bigint
  toTx(address: string, maxRetries: number): AnyPapiTx
  toHuman(): {
    readonly amountInPerTrade: string
    readonly amountIn: string
    readonly amountOut: string
    readonly maxAmountIn: string
    readonly reps: number
    readonly time: number
    readonly tradeFee: string
    readonly error: TwapError | null
  }
}

export enum TwapError {
  OrderTooSmall = "OrderTooSmall",
  OrderTooBig = "OrderTooBig",
  OrderImpactTooBig = "OrderImpactTooBig",
}

export class TwapApi extends TradeApi {
  /**
   * Get TWAP sell execution info & build order tx
   *
   * @param amountInMin - minimum budget to schedule an order, specified in native currency
   * @param assetIn - asset in
   * @param assetOut - asset out
   * @param trade - trade execution info
   * @param txFee - trade transaction fee
   * @param blockTime - avg block time (ms)
   * @returns twap sell order
   */
  async getSellTwap(
    amountInMin: bigint,
    assetIn: TAsset,
    assetOut: TAsset,
    trade: Trade,
    txFee: bigint,
    blockTime: number,
    slippageTwap: string,
  ): Promise<TwapOrder> {
    const { amountIn } = trade
    const priceDifference = Math.abs(trade.priceImpactPct)
    const tradesNumber = this.getTradesNo(priceDifference, blockTime)
    const txFees = this.getFees(tradesNumber, txFee)
    const executionTime = this.getExecutionTime(tradesNumber, blockTime)

    const amountInPerTrade = Big((amountIn - txFees).toString()).div(
      tradesNumber,
    )
    const bestSell = await this._router.getBestSell(
      Number(assetIn.id),
      Number(assetOut.id),
      scaleHuman(amountInPerTrade.toString(), assetIn.decimals),
    )

    const amountOutTotal = bestSell.amountOut * BigInt(tradesNumber)
    const minAmountOut = getTradeMinAmountOut(bestSell, slippageTwap)
    const minAmountOutTotal = minAmountOut.amount * BigInt(tradesNumber)

    const isSingleTrade = tradesNumber === 1
    const isLessThanMinimalAmount = amountInPerTrade.lt(amountInMin.toString())
    const isOrderImpactTooBig = bestSell.priceImpactPct < TWAP_MAX_PRICE_IMPACT

    let tradeError: TwapError | null = null
    if (isLessThanMinimalAmount || isSingleTrade) {
      tradeError = TwapError.OrderTooSmall
    } else if (isOrderImpactTooBig) {
      tradeError = TwapError.OrderImpactTooBig
    }

    const orderTx = (address: string, maxRetries: number) =>
      this._api.tx.DCA.schedule({
        schedule: {
          owner: address,
          period: TWAP_BLOCK_PERIOD,
          max_retries: maxRetries,
          total_amount: amountIn,
          slippage: Number(slippageTwap) * 10000,
          order: {
            type: "Sell",
            value: {
              asset_in: Number(assetIn.id),
              asset_out: Number(assetOut.id),
              amount_in: bestSell.amountIn,
              min_amount_out: minAmountOut.amount,
              route: this._txUtils.buildRoute(bestSell.swaps),
            },
          },
          stability_threshold: undefined,
        },
        start_execution_block: undefined,
      })

    const estimateFee = (fee: bigint) => {
      return this.getFees(tradesNumber, fee)
    }

    const { tradeFee, priceImpactPct } = bestSell
    const fee = tradeFee * BigInt(tradesNumber)
    return {
      amountInPerTrade: bestSell.amountIn,
      amountIn: amountIn,
      amountOut: amountOutTotal,
      minAmountOut: minAmountOutTotal,
      priceImpactPct: priceImpactPct,
      reps: tradesNumber,
      time: executionTime,
      tradeFee: fee,
      error: tradeError,
      estimateFee: estimateFee.bind(this),
      toTx: orderTx,
      toHuman(): Partial<TwapOrder["toHuman"]> {
        return {
          amountInPerTrade: scaleHuman(bestSell.amountIn, assetIn.decimals),
          amountIn: scaleHuman(amountIn, assetIn.decimals),
          amountOut: scaleHuman(amountOutTotal, assetOut.decimals),
          minAmountOut: scaleHuman(minAmountOutTotal, assetOut.decimals),
          priceImpactPct: priceImpactPct,
          reps: tradesNumber,
          time: executionTime,
          tradeFee: scaleHuman(fee, assetOut.decimals),
          error: tradeError,
        }
      },
    } as TwapOrder
  }

  /**
   * Get TWAP buy execution info & build order tx
   *
   * @param amountInMin - minimum budget to schedule an order, specified in native currency
   * @param assetIn - asset in
   * @param assetOut - asset out
   * @param trade - trade execution info
   * @param txFee - trade transaction fee
   * @param blockTime - avg block time (ms)
   * @returns twap buy order
   */
  async getBuyTwap(
    amountInMin: bigint,
    assetIn: TAsset,
    assetOut: TAsset,
    trade: Trade,
    txFee: bigint,
    blockTime: number,
    slippageTwap: string,
  ): Promise<TwapOrder> {
    const { amountOut } = trade
    const priceDifference = Math.abs(trade.priceImpactPct)

    const tradesNumber = this.getTradesNo(priceDifference, blockTime)
    const txFees = this.getFees(tradesNumber, txFee)
    const executionTime = this.getExecutionTime(tradesNumber, blockTime)

    const amountOutPerTrade = Big(amountOut.toString()).div(tradesNumber)
    const bestBuy = await this._router.getBestBuy(
      Number(assetIn.id),
      Number(assetOut.id),
      scaleHuman(amountOutPerTrade.toString(), assetOut.decimals),
    )

    const amountInTotal = bestBuy.amountIn * BigInt(tradesNumber) + txFees

    const maxAmountIn = getTradeMaxAmountIn(bestBuy, slippageTwap)
    const maxAmountInTotal = maxAmountIn.amount * BigInt(tradesNumber) + txFees

    const isSingleTrade = tradesNumber === 1
    const isLessThanMinimalAmount = maxAmountInTotal < amountInMin
    const isOrderTooBig = priceDifference === 100

    let tradeError: TwapError | null = null
    if (isLessThanMinimalAmount || isSingleTrade) {
      tradeError = TwapError.OrderTooSmall
    } else if (isOrderTooBig) {
      tradeError = TwapError.OrderTooBig
    }

    const orderTx = (address: string, maxRetries: number) =>
      this._api.tx.DCA.schedule({
        schedule: {
          owner: address,
          period: TWAP_BLOCK_PERIOD,
          max_retries: maxRetries,
          total_amount: maxAmountInTotal,
          slippage: Number(slippageTwap) * 10000,
          order: {
            type: "Buy",
            value: {
              asset_in: Number(assetIn.id),
              asset_out: Number(assetOut.id),
              amount_out: bestBuy.amountOut,
              max_amount_in: maxAmountIn.amount,
              route: this._txUtils.buildRoute(bestBuy.swaps),
            },
          },
          stability_threshold: undefined,
        },
        start_execution_block: undefined,
      })

    const estimateFee = (txfee: bigint) => {
      return this.getFees(tradesNumber, txfee)
    }

    const { tradeFee, priceImpactPct } = bestBuy
    const fee = tradeFee * BigInt(tradesNumber)
    return {
      amountInPerTrade: bestBuy.amountIn,
      amountIn: amountInTotal,
      amountOut: amountOut,
      maxAmountIn: maxAmountInTotal,
      priceImpactPct: priceImpactPct,
      reps: tradesNumber,
      time: executionTime,
      tradeFee: fee,
      error: tradeError,
      estimateFee: estimateFee.bind(this),
      toTx: orderTx,
      toHuman() {
        return {
          amountInPerTrade: scaleHuman(bestBuy.amountIn, assetIn.decimals),
          amountIn: scaleHuman(amountInTotal, assetIn.decimals),
          amountOut: scaleHuman(amountOut, assetOut.decimals),
          maxAmountIn: scaleHuman(maxAmountInTotal, assetIn.decimals),
          reps: tradesNumber,
          time: executionTime,
          tradeFee: scaleHuman(fee, assetIn.decimals),
          error: tradeError,
        }
      },
    } as TwapOrder
  }

  /**
   * Calculate no of trades for twap order execution. We aim to achieve
   * price impact 0.1% per single execution with max execution time 6 hours.
   *
   * @param priceDifference - price difference of swap execution (single trade)
   * @param blockTime - block time in ms
   * @returns optimal no of trades for twap execution
   */
  private getTradesNo(priceDifference: number, blockTime: number): number {
    const noOfTrades = this.getOptimizedTradesNo(priceDifference)
    const executionTime = noOfTrades * TWAP_BLOCK_PERIOD * blockTime

    if (executionTime > TWAP_MAX_DURATION) {
      const maxNoOfTrades = TWAP_MAX_DURATION / (blockTime * TWAP_BLOCK_PERIOD)
      return Math.round(maxNoOfTrades)
    }
    return noOfTrades
  }

  /**
   * Calculate approx. execution time
   *
   * @param tradesNo - number of trades required to execute order
   * @param blockTime - block time in ms
   * @returns unix representation of execution time
   */
  private getExecutionTime(tradesNo: number, blockTime: number): number {
    return tradesNo * TWAP_BLOCK_PERIOD * blockTime
  }

  /**
   * Calculate approx. tx fees
   *
   * @param tradesNo - number of trades required to execute order
   * @param txFee - trade transaction fee (single trade)
   * @returns twap fees
   */
  private getFees(tradesNo: number, txFee: bigint): bigint {
    return txFee * BigInt(TWAP_TX_MULTIPLIER) * BigInt(tradesNo)
  }
}
