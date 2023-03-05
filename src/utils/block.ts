import BigNumber from "bignumber.js"
import { BLOCK_TIME } from "./constants"
import { addSeconds, subSeconds } from "date-fns"
import { useQueryReduce } from "./helpers"
import { useBestNumber } from "api/chain"

export const getExpectedBlockDate = (
  currentBlock: BigNumber,
  blockNumber: BigNumber,
) => {
  const currentDate = new Date()
  const expectedSeconds = blockNumber.minus(currentBlock).div(BLOCK_TIME)
  return addSeconds(currentDate, expectedSeconds.toNumber())
}

export const useEnteredDate = (enteredAtBlock: BigNumber) => {
  const bestNumber = useBestNumber()

  return useQueryReduce([bestNumber] as const, (bestNumber) => {
    const currentBlock = bestNumber.relaychainBlockNumber.toBigNumber()
    const blockRange = currentBlock.minus(enteredAtBlock)
    const blockRangeSeconds = blockRange.times(BLOCK_TIME)

    const currentDateSeconds = new BigNumber(Date.now())
    const enteredAtDateSeconds = currentDateSeconds.minus(blockRangeSeconds)

    const rangeSeconds = currentDateSeconds.minus(enteredAtDateSeconds)
    const enteredAtDate = subSeconds(Date.now(), rangeSeconds.toNumber())

    return enteredAtDate
  })
}
