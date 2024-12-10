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
          exitFarms: Array<string>
          isActiveFarm: boolean
          yieldFarmId: string
        }>
      >((acc, farm) => {
        const { yieldFarmId, globalFarmId, depositId, isActiveFarm } = farm
        const liquidityPositionId = farm.liquidityPositionId!

        const existingEntry = acc.find(
          (entry) => entry.liquidityPositionId === liquidityPositionId,
        )

        if (existingEntry && isActiveFarm) {
          existingEntry.joinFarms.push([globalFarmId, yieldFarmId])
          existingEntry.exitFarms.push(yieldFarmId)
        } else {
          acc.push({
            liquidityPositionId,
            joinFarms: isActiveFarm ? [[globalFarmId, yieldFarmId]] : [],
            exitFarms: isActiveFarm ? [yieldFarmId] : [],
            depositId,
            isActiveFarm,
            yieldFarmId,
          })
        }

        return acc
      }, [])

      const omnipoolTxs = farmEntries.flatMap((farmEntry) => [
        ...(farmEntry.exitFarms.length
          ? [
              api.tx.omnipoolLiquidityMining.exitFarms(
                farmEntry.depositId,
                farmEntry.exitFarms,
              ),
              api.tx.omnipoolLiquidityMining.joinFarms(
                farmEntry.joinFarms,
                farmEntry.liquidityPositionId,
              ),
            ]
          : []),
        ...(farmEntry.isActiveFarm
          ? []
          : [
              api.tx.omnipoolLiquidityMining.withdrawShares(
                farmEntry.depositId,
                farmEntry.yieldFarmId,
              ),
            ]),
      ])

      return omnipoolTxs
    }

    const createXykTxs = (farms: TClaimableFarmValue[]) => {
      if (!farms.length) return []

      const farmEntries = farms.reduce<
        Array<{
          depositId: string
          joinFarms: Array<[string, string]>
          exitFarms: Array<string>
          assetPair: AssetPair
          shares: string
          yieldFarmId: string
          isActiveFarm: boolean
        }>
      >((acc, farm) => {
        const {
          yieldFarmId,
          globalFarmId,
          depositId,
          shares,
          poolId,
          isActiveFarm,
        } = farm
        const meta = getShareTokenByAddress(poolId)

        if (meta) {
          const existingEntry = acc.find(
            (entry) => entry.depositId === depositId,
          )

          if (existingEntry && isActiveFarm) {
            existingEntry.joinFarms.push([globalFarmId, yieldFarmId])
            existingEntry.exitFarms.push(yieldFarmId)
          } else {
            acc.push({
              depositId,
              joinFarms: isActiveFarm ? [[globalFarmId, yieldFarmId]] : [],
              exitFarms: isActiveFarm ? [yieldFarmId] : [],
              assetPair: {
                assetIn: meta.assets[0].id,
                assetOut: meta.assets[1].id,
              },
              shares,
              isActiveFarm,
              yieldFarmId,
            })
          }
        }

        return acc
      }, [])

      const xykTxs = farmEntries.flatMap((farmEntry) => [
        ...(farmEntry.exitFarms.length
          ? [
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
            ]
          : []),
        ...(farmEntry.isActiveFarm
          ? []
          : [
              api.tx.xykLiquidityMining.withdrawShares(
                farmEntry.depositId,
                farmEntry.yieldFarmId,
                farmEntry.assetPair,
              ),
            ]),
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
    if (BN(range).times(100).lte(WARNING_LIMIT)) {
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
