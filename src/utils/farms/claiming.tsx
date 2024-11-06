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
import { TClaimableFarmValue, useRefetchClaimableFarmValues } from "api/farms"
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
  const refetchAccountAssets = useRefetchAccountAssets()
  const refetchClaimableValues = useRefetchClaimableFarmValues()

  const [confirmationNeeded, setConfirmationNeeded] = useState(false)

  const mutation = useMutation(async () => {
    let omnipoolFarms: TClaimableFarmValue[] = []
    let xykFarms: TClaimableFarmValue[] = []

    claimableFarms?.forEach((farm) =>
      (farm.isXyk ? xykFarms : omnipoolFarms).push(farm),
    )

    const createOmnipoolTxs = (farms: TClaimableFarmValue[]) => {
      if (!farms.length) return []

      const farmEntries = farms.reduce<
        Array<{
          liquidityPositionId: string
          depositId: string
          joinFarms: Array<[string, string]>
          exitFarms: Array<[string]>
        }>
      >((acc, farm) => {
        const { yieldFarmId, globalFarmId, depositId } = farm
        const liquidityPositionId = farm.liquidityPositionId!

        const existingEntry = acc.find(
          (entry) => entry.liquidityPositionId === liquidityPositionId,
        )

        if (existingEntry) {
          existingEntry.joinFarms.push([globalFarmId, yieldFarmId])
          existingEntry.exitFarms.push([yieldFarmId])
        } else {
          acc.push({
            liquidityPositionId,
            joinFarms: [[globalFarmId, yieldFarmId]],
            exitFarms: [[yieldFarmId]],
            depositId,
          })
        }

        return acc
      }, [])

      const omnipoolTxs = farmEntries.flatMap((farmEntry) => [
        api.tx.omnipoolLiquidityMining.exitFarms(
          farmEntry.depositId,
          farmEntry.exitFarms,
        ),
        api.tx.omnipoolLiquidityMining.joinFarms(
          farmEntry.joinFarms,
          farmEntry.liquidityPositionId,
        ),
      ])

      return omnipoolTxs
    }

    const createXykTxs = (farms: TClaimableFarmValue[]) => {
      if (!farms.length) return []

      const farmEntries = farms.reduce<
        Array<{
          depositId: string
          joinFarms: Array<[string, string]>
          exitFarms: Array<[string]>
          assetPair: AssetPair
          shares: string
        }>
      >((acc, farm) => {
        const { yieldFarmId, globalFarmId, depositId, shares, poolId } = farm
        const meta = getShareTokenByAddress(poolId)

        if (meta) {
          const existingEntry = acc.find(
            (entry) => entry.depositId === depositId,
          )

          if (existingEntry) {
            existingEntry.joinFarms.push([globalFarmId, yieldFarmId])
            existingEntry.exitFarms.push([yieldFarmId])
          } else {
            acc.push({
              depositId,
              joinFarms: [[globalFarmId, yieldFarmId]],
              exitFarms: [[yieldFarmId]],
              assetPair: {
                assetIn: meta.assets[0].id,
                assetOut: meta.assets[1].id,
              },
              shares,
            })
          }
        }

        return acc
      }, [])

      const xykTxs = farmEntries.flatMap((farmEntry) => [
        api.tx.xykLiquidityMining.exitFarms(
          farmEntry.depositId,
          farmEntry.assetPair,
          farmEntry.exitFarms,
        ),
        api.tx.xykLiquidityMining.joinFarms(
          farmEntry.joinFarms,
          farmEntry.assetPair,
          farmEntry.shares,
        ),
      ])

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
        {
          toast,
          onBack,
          onClose,
          onSuccess: () => {
            refetchClaimableValues()
            refetchAccountAssets()
          },
        },
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
