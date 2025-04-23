import { useBestNumber } from "api/chain"
import BN from "bignumber.js"
import { addSeconds, subSeconds } from "date-fns"
import { BLOCK_TIME } from "./constants"
import { useQueryReduce } from "./helpers"

export const getExpectedBlockDate = (currentBlock: BN, blockNumber: BN) => {
  const currentDate = new Date()
  const expectedSeconds = blockNumber.minus(currentBlock).div(BLOCK_TIME)
  return addSeconds(currentDate, expectedSeconds.toNumber())
}

export const useEnteredDate = (enteredAtBlock: BN) => {
  const bestNumber = useBestNumber()

  return useQueryReduce([bestNumber] as const, (bestNumber) =>
    getEnteredDate(
      enteredAtBlock,
      bestNumber.relaychainBlockNumber.toBigNumber(),
    ),
  )
}

export const getEnteredDate = (enteredAtBlock: BN, currentBlock: BN) => {
  const blockRange = currentBlock.minus(enteredAtBlock)
  const blockRangeSeconds = blockRange.times(BLOCK_TIME)

  const currentDateSeconds = new BN(Date.now())
  const enteredAtDateSeconds = currentDateSeconds.minus(blockRangeSeconds)

  const rangeSeconds = currentDateSeconds.minus(enteredAtDateSeconds)
  const enteredAtDate = subSeconds(Date.now(), rangeSeconds.toNumber())

  return enteredAtDate
}
