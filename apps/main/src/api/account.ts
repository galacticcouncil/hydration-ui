import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { HydrationQueries } from "@polkadot-api/descriptors"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"
import { useCallback } from "react"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { A_TOKEN_UNDERLYING_ID_MAP } from "@/config/atokens"
import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"

import { uniquesIds } from "./constants"

type OmnipoolWarehouseLMDeposit =
  HydrationQueries["OmnipoolWarehouseLM"]["Deposit"]["Value"]

type OmnipoolDeposit = OmnipoolWarehouseLMDeposit & {
  positionId: bigint
  miningId: bigint
}

export type OmnipoolDepositFull = Omit<
  OmnipoolWarehouseLMDeposit,
  "amm_pool_id"
> &
  OmnipoolPosition & {
    miningId: string
  }

export type XykDeposit =
  HydrationQueries["XYKWarehouseLM"]["Deposit"]["Value"] & {
    id: string
  }

export type OmnipoolPosition = Omit<
  HydrationQueries["Omnipool"]["Positions"]["Value"],
  "asset_id"
> & {
  positionId: string
  assetId: string
}

export const useAccountInfo = (options?: UseBaseObservableQueryOptions) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiObservableQuery("System.Account", [address, "best"], options)
}

export const accountBalanceQueryKey = (address: string | undefined) => [
  QUERY_KEY_BLOCK_PREFIX,
  "account",
  "balance",
  address,
]

export const useRefetchAccountBalance = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useCallback(() => {
    queryClient.refetchQueries({
      queryKey: accountBalanceQueryKey(account?.address),
    })
  }, [account?.address, queryClient])
}

export const useAccountBalance = () => {
  const address = useAccount().account?.address
  const { papi, sdk, isLoaded } = useRpcProvider()
  const setBalance = useAccountData(prop("setBalance"))

  return useQuery({
    enabled: !!address && isLoaded,
    queryKey: accountBalanceQueryKey(address),
    queryFn: async () => {
      if (!address) return null

      const balancesRaw = await papi.apis.CurrenciesApi.accounts(address, {
        at: "best",
      })

      if (!balancesRaw) {
        return null
      }

      const maxReservesMap = await (async () => {
        try {
          const maxReserves = await sdk.api.aave.getMaxWithdrawAll(address)

          return new Map(
            Object.entries(maxReserves).map(([token, amount]) => [
              token,
              amount,
            ]),
          )
        } catch (err) {
          console.error(err)
          return new Map()
        }
      })()

      const balances = balancesRaw.map(([assetId, balance]) => {
        const registryId = A_TOKEN_UNDERLYING_ID_MAP[assetId]
        const maxReserve = registryId
          ? maxReservesMap.get(registryId)
          : undefined

        const free = maxReserve?.amount ?? balance.free
        const reserved = balance.reserved
        const total = (balance.free > free ? balance.free : free) + reserved

        return {
          free,
          total,
          reserved,
          assetId: assetId.toString(),
        }
      })

      setBalance(balances)

      return null
    },
    notifyOnChangeProps: [],
    staleTime: millisecondsInHour,
  })
}

export const useAccountUniques = () => {
  const address = useAccount().account?.address
  const provider = useRpcProvider()
  const { papi } = provider

  const { data: nftIds } = useQuery(uniquesIds(provider))
  const { positions, setPositions } = useAccountData(
    useShallow(pick(["positions", "setPositions"])),
  )

  return useQuery({
    enabled: !!address && !!nftIds,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "account", "uniques", address],
    queryFn: async () => {
      if (!address || !nftIds) return null
      const { omnipoolNftId, miningNftId, xykMiningNftId } = nftIds

      const [omnipoolNftsRaw, miningNftsRaw, xykMiningNftsRaw] =
        await Promise.all([
          papi.query.Uniques.Account.getEntries(address, omnipoolNftId),
          papi.query.Uniques.Account.getEntries(address, miningNftId),
          papi.query.Uniques.Account.getEntries(address, xykMiningNftId),
        ])

      const isSame =
        positions.omnipool.length === omnipoolNftsRaw.length &&
        positions.omnipoolMining.length === miningNftsRaw.length &&
        positions.xykMining.length === xykMiningNftsRaw.length

      if (!isSame) {
        const [
          omnipoolPositions,
          omnipoolDepositPositionIds,
          omnipoolDeposits,
          xykDeposits,
        ] = await Promise.all([
          papi.query.Omnipool.Positions.getValues(
            omnipoolNftsRaw.map(({ keyArgs }) => [keyArgs[2]]),
          ),
          papi.query.OmnipoolLiquidityMining.OmniPositionId.getValues(
            miningNftsRaw.map(({ keyArgs }) => [keyArgs[2]]),
          ),
          papi.query.OmnipoolWarehouseLM.Deposit.getValues(
            miningNftsRaw.map(({ keyArgs }) => [keyArgs[2]]),
          ),
          papi.query.XYKWarehouseLM.Deposit.getValues(
            xykMiningNftsRaw.map(({ keyArgs }) => [keyArgs[2]]),
          ),
        ])

        const validOmnipoolDeposits = omnipoolDepositPositionIds.reduce<
          Array<OmnipoolDeposit>
        >((acc, positionId, i) => {
          const miningNft = miningNftsRaw[i]
          const data = omnipoolDeposits[i]

          if (positionId && miningNft && data) {
            acc.push({ miningId: miningNft.keyArgs[2], positionId, ...data })
          }

          return acc
        }, [])

        const omnipoolDepositPositions =
          await papi.query.Omnipool.Positions.getValues(
            validOmnipoolDeposits.map(({ positionId }) => [positionId]),
          )

        const positions = {
          omnipool: omnipoolNftsRaw.reduce<OmnipoolPosition[]>(
            (acc, { keyArgs }, i) => {
              const position = omnipoolPositions[i]

              if (position) {
                acc.push({
                  positionId: keyArgs[2].toString(),
                  assetId: position?.asset_id.toString(),
                  shares: position?.shares,
                  price: position?.price,
                  amount: position?.amount,
                })
              }

              return acc
            },
            [],
          ),
          omnipoolMining: omnipoolDepositPositions.reduce<
            OmnipoolDepositFull[]
          >((acc, depositPosition, i) => {
            const data = validOmnipoolDeposits[i]

            if (data && depositPosition) {
              acc.push({
                miningId: data.miningId.toString(),
                positionId: data.positionId.toString(),
                yield_farm_entries: data.yield_farm_entries,
                shares: data.shares,
                assetId: depositPosition.asset_id.toString(),
                amount: depositPosition.amount,
                price: depositPosition.price,
              })
            }

            return acc
          }, []),
          xykMining: xykMiningNftsRaw.reduce<XykDeposit[]>(
            (acc, { keyArgs }, i) => {
              const data = xykDeposits[i]

              if (data) {
                acc.push({ ...data, id: keyArgs[2].toString() })
              }

              return acc
            },
            [],
          ),
        }

        setPositions(positions)
      }

      return null
    },
    notifyOnChangeProps: [],
    staleTime: millisecondsInHour,
  })
}
