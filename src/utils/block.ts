import BigNumber from "bignumber.js"
import { BLOCK_TIME } from "./constants"
import { addSeconds } from "date-fns"

export const getExpectedBlockDate = (
  currentBlock: BigNumber,
  blockNumber: BigNumber,
) => {
  const currentDate = new Date()
  const expectedSeconds = blockNumber.minus(currentBlock).div(BLOCK_TIME)
  return addSeconds(currentDate, expectedSeconds.toNumber())
}
