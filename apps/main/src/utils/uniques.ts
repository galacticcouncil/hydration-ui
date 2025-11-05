import {
  AccountUniquesEntries,
  OmnipoolDeposit,
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"
import { Papi } from "@/providers/rpcProvider"

export const getUniquesEntriesIds = (
  entries: AccountUniquesEntries,
): [bigint][] => entries.map(({ args }) => [args[2]])

export const getOmnipoolPositions = async (
  papi: Papi,
  entries: AccountUniquesEntries,
) => {
  const positions = await papi.query.Omnipool.Positions.getValues(
    entries.map(({ args }) => [args[2]]),
    { at: "best" },
  )
  return entries.reduce<OmnipoolPosition[]>((acc, { args }, i) => {
    const position = positions[i]

    if (position) {
      acc.push({
        positionId: args[2].toString(),
        assetId: position?.asset_id.toString(),
        shares: position?.shares,
        price: position?.price,
        amount: position?.amount,
      })
    }

    return acc
  }, [])
}

export const getOmnipoolMiningPositions = async (
  papi: Papi,
  entries: AccountUniquesEntries,
) => {
  const ids = getUniquesEntriesIds(entries)
  const [omnipoolDepositPositionIds, omnipoolDeposits] = await Promise.all([
    papi.query.OmnipoolLiquidityMining.OmniPositionId.getValues(ids, {
      at: "best",
    }),
    papi.query.OmnipoolWarehouseLM.Deposit.getValues(ids, { at: "best" }),
  ])

  const validOmnipoolDeposits = omnipoolDepositPositionIds.reduce<
    OmnipoolDeposit[]
  >((acc, positionId, i) => {
    const miningNft = entries[i]
    const depositData = omnipoolDeposits[i]

    if (positionId && miningNft && depositData) {
      acc.push({ miningId: miningNft.args[2], positionId, ...depositData })
    }

    return acc
  }, [])

  const omnipoolDepositPositions =
    await papi.query.Omnipool.Positions.getValues(
      validOmnipoolDeposits.map(({ positionId }) => [positionId]),
    )

  return omnipoolDepositPositions.reduce<OmnipoolDepositFull[]>(
    (acc, depositPosition, i) => {
      const depositData = validOmnipoolDeposits[i]

      if (depositData && depositPosition) {
        acc.push({
          miningId: depositData.miningId.toString(),
          positionId: depositData.positionId.toString(),
          yield_farm_entries: depositData.yield_farm_entries,
          shares: depositData.shares,
          assetId: depositPosition.asset_id.toString(),
          amount: depositPosition.amount,
          price: depositPosition.price,
        })
      }

      return acc
    },
    [],
  )
}

export const getXykMiningPositions = async (
  papi: Papi,
  entries: AccountUniquesEntries,
) => {
  const ids = getUniquesEntriesIds(entries)
  const xykDeposits = await papi.query.XYKWarehouseLM.Deposit.getValues(ids, {
    at: "best",
  })

  return entries.reduce<XykDeposit[]>((acc, { args }, i) => {
    const depositData = xykDeposits[i]

    if (depositData) {
      acc.push({ ...depositData, id: args[2].toString() })
    }

    return acc
  }, [])
}
