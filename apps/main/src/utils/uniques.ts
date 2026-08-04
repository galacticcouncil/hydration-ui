import {
  AccountUniquesValues,
  OmnipoolDeposit,
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"
import { Papi } from "@/providers/rpcProvider"

export const getUniquesEntriesIds = (
  entries: AccountUniquesValues,
): [bigint][] => entries.map(({ keyArgs }) => [keyArgs[2]])

export const getOmnipoolPositions = async (
  papi: Papi,
  entries: AccountUniquesValues,
) => {
  const positions = await papi.query.Omnipool.Positions.getValues(
    getUniquesEntriesIds(entries),
    { at: "best" },
  )
  const result: OmnipoolPosition[] = []

  for (const [i, entry] of entries.entries()) {
    const position = positions[i]

    if (position) {
      result.push({
        positionId: entry.keyArgs[2].toString(),
        assetId: position.asset_id.toString(),
        shares: position.shares,
        price: position.price,
        amount: position.amount,
      })
    }
  }

  return result
}

export const getOmnipoolMiningPositions = async (
  papi: Papi,
  entries: AccountUniquesValues,
) => {
  const ids = getUniquesEntriesIds(entries)
  const [omnipoolDepositPositionIds, omnipoolDeposits] = await Promise.all([
    papi.query.OmnipoolLiquidityMining.OmniPositionId.getValues(ids, {
      at: "best",
    }),
    papi.query.OmnipoolWarehouseLM.Deposit.getValues(ids, { at: "best" }),
  ])

  const validOmnipoolDeposits: OmnipoolDeposit[] = []

  for (const [i, positionId] of omnipoolDepositPositionIds.entries()) {
    const miningNft = entries[i]
    const depositData = omnipoolDeposits[i]

    if (positionId && miningNft && depositData) {
      validOmnipoolDeposits.push({
        miningId: miningNft.keyArgs[2],
        positionId,
        ...depositData,
      })
    }
  }

  const omnipoolDepositPositions =
    await papi.query.Omnipool.Positions.getValues(
      validOmnipoolDeposits.map(({ positionId }) => [positionId]),
      { at: "best" },
    )

  const result: OmnipoolDepositFull[] = []

  for (const [i, depositPosition] of omnipoolDepositPositions.entries()) {
    const depositData = validOmnipoolDeposits[i]

    if (depositData && depositPosition) {
      result.push({
        miningId: depositData.miningId.toString(),
        positionId: depositData.positionId.toString(),
        yield_farm_entries: depositData.yield_farm_entries,
        shares: depositData.shares,
        assetId: depositPosition.asset_id.toString(),
        amount: depositPosition.amount,
        price: depositPosition.price,
      })
    }
  }

  return result
}

export const getXykMiningPositions = async (
  papi: Papi,
  entries: AccountUniquesValues,
) => {
  const ids = getUniquesEntriesIds(entries)
  const xykDeposits = await papi.query.XYKWarehouseLM.Deposit.getValues(ids, {
    at: "best",
  })

  const miningPositions: XykDeposit[] = []

  for (const [i, entry] of entries.entries()) {
    const depositData = xykDeposits[i]

    if (depositData) {
      miningPositions.push({ ...depositData, id: entry.keyArgs[2].toString() })
    }
  }

  return miningPositions
}
