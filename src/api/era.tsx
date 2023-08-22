import BN from "bignumber.js"
import { addSeconds } from "date-fns"
import { ExtrinsicEra } from "@polkadot/types/interfaces/extrinsics"
import { bnToBn } from "@polkadot/util"
import { useTimestamp } from "./timestamp"
import { useMemo } from "react"
import { BLOCK_TIME } from "utils/constants"

export const useEra = (
  era: ExtrinsicEra,
  hexBlockNumber?: string,
  enabled = true,
) => {
  const blockNumber = bnToBn(hexBlockNumber)

  const mortal = useMemo(() => {
    if (era.isMortalEra) {
      const mortal = era.asMortalEra
      const period = new BN(mortal.period.toHex()) // Blocks validity

      if (!blockNumber.isZero()) {
        const birth = new BN(mortal.birth(blockNumber))
        const death = new BN(mortal.death(blockNumber))
        return {
          birth,
          death,
          period,
        }
      }
    }
    return null
  }, [era, blockNumber])

  const timestamp = useTimestamp(mortal?.birth, enabled)

  return useMemo(() => {
    if (timestamp.data && mortal?.period) {
      const birthDate = new Date(timestamp.data)
      const deathDate = addSeconds(
        birthDate,
        mortal.period.times(BLOCK_TIME).toNumber(),
      )
      return {
        birthDate,
        deathDate,
      }
    }

    return null
  }, [timestamp.data, mortal?.period])
}
