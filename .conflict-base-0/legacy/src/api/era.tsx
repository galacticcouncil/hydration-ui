import BN from "bignumber.js"
import { addSeconds } from "date-fns"
import { ExtrinsicEra } from "@polkadot/types/interfaces/extrinsics"
import { bnToBn } from "@polkadot/util"
import { useTimestamp } from "./timestamp"
import { useMemo } from "react"
import { PARACHAIN_BLOCK_TIME } from "utils/constants"

const DEFAULT_PERIOD = 900

export const useEra = (
  era: ExtrinsicEra,
  hexBlockNumber?: string,
  enabled = true,
) => {
  const blockNumber = bnToBn(hexBlockNumber)

  const mortal = useMemo(() => {
    if (blockNumber.isZero()) return null
    if (era.isMortalEra) {
      const mortal = era.asMortalEra
      const period = new BN(mortal.period.toHex()) // Blocks validity

      const birth = new BN(mortal.birth(blockNumber))
      const death = new BN(mortal.death(blockNumber))
      return {
        birth,
        death,
        period,
      }
    }

    const birth = new BN(blockNumber.toString())
    const period = new BN(DEFAULT_PERIOD)
    return {
      birth,
      death: birth.plus(period),
      period,
    }
  }, [era, blockNumber])

  const timestamp = useTimestamp(mortal?.birth, enabled)

  return useMemo(() => {
    if (timestamp.data && mortal?.period) {
      const birthDate = new Date(timestamp.data)
      const deathDate = addSeconds(
        birthDate,
        mortal.period.times(PARACHAIN_BLOCK_TIME).toNumber(),
      )
      return {
        birthDate,
        deathDate,
        period: mortal.period,
        isLoading: false,
      }
    }

    return {
      birthDate: null,
      deathDate: null,
      period: null,
      isLoading: timestamp.isLoading,
    }
  }, [timestamp.data, timestamp.isLoading, mortal?.period])
}
