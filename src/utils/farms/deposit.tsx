import { TFarmAprData, useAccountClaimableFarmValues } from "api/farms"
import { Trans } from "react-i18next"
import { ToastMessage, TransactionOptions, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { createToastMessages, TOAST_MESSAGES } from "state/toasts"
import { ApiPromise } from "@polkadot/api"
import { t } from "i18next"
import BN from "bignumber.js"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { scaleHuman } from "utils/balance"
import { TShareToken, useAssets } from "providers/assets"
import { useRefetchAccountAssets } from "api/deposits"
import { useMutation } from "@tanstack/react-query"

type XYKInput = { shares: string; depositId?: string }
type OmnipoolInput = { positionId: string; value: string; depositId?: string }

export type TJoinFarmsInput = XYKInput | OmnipoolInput

export type RejoinFarm = {
  farms: TFarmAprData[]
  depositId: string
  currentValue?: string
}

const isXYKData = (data: TJoinFarmsInput): data is XYKInput => {
  return (data as XYKInput).shares !== undefined
}

const xykRedepositTx = (
  api: ApiPromise,
  farm: TFarmAprData,
  depositId: string,
  { assetIn, assetOut }: { assetIn: string; assetOut: string },
) =>
  api.tx.xykLiquidityMining.redepositShares(
    farm.globalFarmId,
    farm.yieldFarmId,
    {
      assetIn,
      assetOut,
    },
    depositId,
  )

const redepositTx = (api: ApiPromise, farm: TFarmAprData, depositId: string) =>
  api.tx.omnipoolLiquidityMining.redepositShares(
    farm.globalFarmId,
    farm.yieldFarmId,
    depositId,
  )

export const getToasts = (value: BN, symbol: string) =>
  TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.join.toast.${msType}`}
        tOptions={{
          amount: value,
          symbol: symbol,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

type TArgs = {
  poolId: string
  farms: TFarmAprData[]
  options?: TransactionOptions
}

export const useJoinFarms = ({ farms, poolId, options }: TArgs) => {
  const { api } = useRpcProvider()
  const refetchAccountAssets = useRefetchAccountAssets()
  const { getAsset } = useAssets()
  const { refetch: refetchClaimableValues } = useAccountClaimableFarmValues()

  const { createTransaction } = useStore()

  const meta = getAsset(poolId)

  return async (data: TJoinFarmsInput) => {
    if (!farms.length) throw new Error("There are no farms to join")
    if (!meta) throw new Error("Missing asset meta")

    const isXyk = isXYKData(data)
    const depositId = data.depositId

    const toast = getToasts(
      scaleHuman(isXyk ? data.shares : data.value, meta.decimals),
      meta.symbol,
    )

    const executeRedeposit = async (
      depositId: string,
      farms: TFarmAprData[],
    ) => {
      let txs: SubmittableExtrinsic[]

      if (isXyk) {
        const { assets } = meta as TShareToken
        txs = farms.map((farm) =>
          xykRedepositTx(api, farm, depositId, {
            assetIn: assets[0].id,
            assetOut: assets[1].id,
          }),
        )
      } else {
        txs = farms.map((farm) => redepositTx(api, farm, depositId))
      }

      await createTransaction(
        {
          tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0],
          title: t("farms.modal.join.rest.title"),
        },
        {
          toast,
          ...options,
          onSuccess: (result) => {
            refetchAccountAssets()
            refetchClaimableValues()
            options?.onSuccess?.(result)
          },
        },
      )
    }

    if (!depositId) {
      let tx: SubmittableExtrinsic

      if (isXyk) {
        const { assets } = meta as TShareToken

        tx = api.tx.xykLiquidityMining.joinFarms(
          farms.map<[string, string]>((farm) => [
            farm.globalFarmId,
            farm.yieldFarmId,
          ]),
          {
            assetIn: assets[0].id,
            assetOut: assets[1].id,
          },
          data.shares,
        )
      } else {
        tx = api.tx.omnipoolLiquidityMining.joinFarms(
          farms.map<[string, string]>((farm) => [
            farm.globalFarmId,
            farm.yieldFarmId,
          ]),
          data.positionId,
        )
      }

      const [farm] = farms
      const rewardCurrencySymbol = getAsset(farm.rewardCurrency)?.symbol

      await createTransaction(
        {
          tx,
          title: t("farms.modal.join.first.title", {
            symbol: rewardCurrencySymbol,
          }),
        },
        {
          toast,
          ...options,
          onSuccess: async (result) => {
            refetchAccountAssets()
            refetchClaimableValues()
            options?.onSuccess?.(result)
          },
        },
      )
    } else {
      await executeRedeposit(depositId, farms)
    }
  }
}

export const useRedepositOmnipoolFarms = ({
  farms,
  total,
  symbol,
  onSubmit,
}: {
  farms: RejoinFarm[]
  total: string
  symbol: string
  onSubmit: () => void
}) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const refetchAccountAssets = useRefetchAccountAssets()
  const { refetch: refetchClaimableValues } = useAccountClaimableFarmValues()

  return useMutation(
    async () => {
      const txs = farms
        .map((farm) =>
          farm.farms.map((farmData) =>
            api.tx.omnipoolLiquidityMining.redepositShares(
              farmData.globalFarmId,
              farmData.yieldFarmId,
              farm.depositId,
            ),
          ),
        )
        .flat()

      const toast = createToastMessages("farms.modal.joinGiga.toast", {
        t,
        tOptions: {
          amount: BN(total),
          symbol,
        },
        components: ["span", "span.highlight"],
      })

      await createTransaction(
        {
          tx: api.tx.utility.forceBatch(txs),
        },
        {
          toast,
          onSubmitted: onSubmit,
        },
      )
    },
    {
      onSuccess: () => {
        refetchAccountAssets()
        refetchClaimableValues()
      },
    },
  )
}
