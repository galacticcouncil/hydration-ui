import { useMutation } from "@tanstack/react-query"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import {
  useClaimingRange,
  WARNING_LIMIT,
} from "sections/pools/farms/components/claimingRange/claimingRange.utils"
import { useState } from "react"
import BN from "bignumber.js"
import { ClaimingWarning } from "sections/pools/farms/components/claimingRange/ClaimingWarning"
import { TClaimableFarmValue } from "api/farms"
import { useAssets } from "providers/assets"
import { useRefetchAccountAssets } from "api/deposits"

type AssetPair = { assetIn: string; assetOut: string }

export const useClaimFarmMutation = (
  claimableFarms?: TClaimableFarmValue[],
  toast?: ToastMessage,
  onClose?: () => void,
  onBack?: () => void,
) => {
  const { api } = useRpcProvider()
  const { getShareTokenByAddress } = useAssets()
  const { createTransaction } = useStore()
  const { range } = useClaimingRange()
  const refetch = useRefetchAccountAssets()

  const [confirmationNeeded, setConfirmationNeeded] = useState(false)

  const mutation = useMutation(async () => {
    let omnipoolFarms: TClaimableFarmValue[] = []
    let xykFarms: TClaimableFarmValue[] = []

    claimableFarms?.forEach((farm) =>
      (farm.isXyk ? xykFarms : omnipoolFarms).push(farm),
    )

    const createOmnipoolTxs = (farms: TClaimableFarmValue[]) => {
      if (!farms.length) return []

      const { joinEntries, exitFarms } = farms.reduce<{
        exitFarms: Array<[string, string]>
        joinEntries: Array<{
          liquidityPositionId: string
          farms: Array<[string, string]>
        }>
      }>(
        (acc, farm) => {
          const { yieldFarmId, globalFarmId, depositId } = farm
          const liquidityPositionId = farm.liquidityPositionId!

          acc.exitFarms.push([depositId, yieldFarmId])

          const existingEntry = acc.joinEntries.find(
            (entry) => entry.liquidityPositionId === liquidityPositionId,
          )

          if (existingEntry) {
            existingEntry.farms.push([globalFarmId, yieldFarmId])
          } else {
            acc.joinEntries.push({
              liquidityPositionId,
              farms: [[globalFarmId, yieldFarmId]],
            })
          }

          return acc
        },
        { joinEntries: [], exitFarms: [] },
      )

      const omnipoolTxs = [
        api.tx.omnipoolLiquidityMining.exitFarms(exitFarms),
        ...joinEntries.map(({ farms, liquidityPositionId }) =>
          api.tx.omnipoolLiquidityMining.joinFarms(farms, liquidityPositionId),
        ),
      ]

      return omnipoolTxs
    }

    const createXykTxs = (farms: TClaimableFarmValue[]) => {
      if (!farms.length) return []

      const { exitFarms, joinEntries } = farms.reduce<{
        exitFarms: Array<[string, string, AssetPair]>
        joinEntries: Array<{
          depositId: string
          farms: Array<[string, string]>
          assetPair: AssetPair
          shares: string
        }>
      }>(
        (acc, farm) => {
          const { yieldFarmId, globalFarmId, depositId, shares, poolId } = farm
          const meta = getShareTokenByAddress(poolId)

          if (meta) {
            acc.exitFarms.push([
              depositId,
              yieldFarmId,
              { assetIn: meta.assets[0].id, assetOut: meta.assets[1].id },
            ])

            const existingEntry = acc.joinEntries.find(
              (entry) => entry.depositId === depositId,
            )

            if (existingEntry) {
              existingEntry.farms.push([globalFarmId, yieldFarmId])
            } else {
              acc.joinEntries.push({
                depositId,
                farms: [[globalFarmId, yieldFarmId]],
                assetPair: {
                  assetIn: meta.assets[0].id,
                  assetOut: meta.assets[1].id,
                },
                shares,
              })
            }
          }

          return acc
        },
        { joinEntries: [], exitFarms: [] },
      )

      const xykTxs = [
        api.tx.xykLiquidityMining.exitFarms(exitFarms),
        ...joinEntries.map(({ farms, assetPair, shares }) =>
          api.tx.xykLiquidityMining.joinFarms(farms, assetPair, shares),
        ),
      ]

      return xykTxs
    }

    const allTxs = [
      ...createOmnipoolTxs(omnipoolFarms),
      ...createXykTxs(xykFarms),
    ]

    if (allTxs.length > 0) {
      return await createTransaction(
        {
          tx: allTxs.length > 1 ? api.tx.utility.batchAll(allTxs) : allTxs[0],
        },
        { toast, onBack, onClose, onSuccess: refetch },
      )
    }
  })

  const claim = () => {
    if (BN(range).times(100).lt(WARNING_LIMIT)) {
      setConfirmationNeeded(true)
    } else {
      mutation.mutate()
      onClose?.()
    }
  }

  return {
    claim,
    isLoading: mutation.isLoading,
    confirmClaimModal: confirmationNeeded ? (
      <ClaimingWarning
        onConfirm={() => {
          setConfirmationNeeded(false)
          mutation.mutate()
          onClose?.()
        }}
        onClose={() => {
          setConfirmationNeeded(false)
          onClose?.()
          mutation.reset()
        }}
      />
    ) : null,
  }
}
