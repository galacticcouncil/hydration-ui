import { Modal } from "components/Modal/Modal"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Controller, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "utils/api"
import { useSpotPrice } from "api/spotPrice"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { calculate_shares } from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { useOmnipoolAsset } from "api/omnipool"
import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useAssetMeta } from "api/assetMeta"
import { BN_10 } from "utils/constants"
import { useAccountStore, useStore } from "state/store"
import { u32 } from "@polkadot/types"
import { FormValues } from "utils/helpers"

type AddLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
  onSuccess: () => void
}

export const AddLiquidity = ({
  isOpen,
  onClose,
  pool,
  onSuccess,
}: AddLiquidityProps) => {
  const [assetId, setAssetId] = useState<u32 | string>(pool?.id.toString())
  const [assetValue, setAssetValue] = useState("")

  const ommipoolAsset = useOmnipoolAsset(assetId)
  const assetMeta = useAssetMeta(assetId)
  const apiIds = useApiIds()
  const spotPrice = useSpotPrice(assetId, apiIds.data?.usdId)
  const api = useApiPromise()
  const omnipoolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)
  const { account } = useAccountStore()
  const assetBalance = useTokenBalance(assetId, account?.address)

  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{
    amount: string
  }>({})

  const calculatedShares = useMemo(() => {
    if (isOpen && ommipoolAsset.data && assetValue && assetMeta.data) {
      const { hubReserve, shares } = ommipoolAsset.data

      const asset_reserve = omnipoolBalance.data?.balance.toString()
      const amount = new BigNumber(assetValue)
        .multipliedBy(BN_10.pow(assetMeta.data.decimals.toString()))
        .toString()

      if (asset_reserve && hubReserve && shares && amount) {
        return calculate_shares(
          asset_reserve,
          hubReserve.toString(),
          shares.toString(),
          amount,
        )
      }
    }
    return null
  }, [omnipoolBalance, assetValue, ommipoolAsset, assetMeta, isOpen])

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.data?.decimals == null) throw new Error("Missing asset meta")

    const amount = new BigNumber(values.amount)
      .multipliedBy(BN_10.pow(assetMeta.data.decimals.toNumber()))
      .toString()

    return await createTransaction(
      {
        tx: api.tx.omnipool.addLiquidity(assetId, amount),
      },
      { onSuccess },
    )
  }

  return (
    <Modal
      open={isOpen}
      title={t("pools.addLiquidity.modal.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{
          flex: "column",
          justify: "space-between",
          height: "100%",
          mt: 10,
        }}
      >
        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.amount.required"),
            validate: {
              maxBalance: (value) => {
                try {
                  if (assetMeta.data?.decimals == null)
                    throw new Error("Missing asset meta")
                  if (
                    assetBalance.data?.balance.gte(
                      BigNumber(value).multipliedBy(
                        BN_10.pow(assetMeta.data.decimals.toNumber()),
                      ),
                    )
                  )
                    return true
                } catch {}
                return t("pools.addLiquidity.modal.validation.notEnoughBalance")
              },
              validNumber: (value) => {
                try {
                  if (!new BigNumber(value).isNaN()) return true
                } catch {}
                return t("error.validNumber")
              },
              positive: (value) =>
                new BigNumber(value).gt(0) || t("error.positive"),
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onBlur={setAssetValue}
              onChange={onChange}
              asset={assetId}
              onAssetChange={setAssetId}
              error={error?.message}
            />
          )}
        />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 20,
            mb: 37,
          }}
        >
          <Text color="basic300" fs={14}>
            {t("pools.pool.liquidity.poolFees")}
          </Text>
          <Text fs={14} color="white">
            TODO
          </Text>
        </div>

        <Text color="pink500" fs={15} font="FontOver" tTransform="uppercase">
          {t("pools.addLiquidity.modal.positionDetails")}
        </Text>

        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 9,
            mb: 4,
          }}
        >
          <Text color="darkBlue300" fs={14}>
            {t("pools.removeLiquidity.modal.price")}
          </Text>
          <Text fs={14} color="white">
            {t("pools.addLiquidity.modal.row.spotPrice", {
              firstAmount: 1,
              firstCurrency: assetMeta.data?.symbol,
              secondAmount: spotPrice?.data?.spotPrice,
            })}
          </Text>
        </div>
        <Separator color="darkBlue401" />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 8,
            mb: 4,
          }}
        >
          <Text color="darkBlue300" fs={14}>
            {t("pools.addLiquidity.modal.receive")}
          </Text>
          <Text fs={14} color="white">
            {t("value", {
              value: calculatedShares,
              fixedPointScale: assetMeta.data?.decimals.toString(),
            })}
          </Text>
        </div>
        <Separator color="darkBlue401" />
        <Text color="warningOrange200" fs={14} fw={400} sx={{ mt: 17, mb: 24 }}>
          {t("pools.addLiquidity.modal.warning")}
        </Text>
        <Separator
          color="darkBlue401"
          sx={{ mx: "-30px", mb: 20, width: "auto" }}
        />
        <Button variant="primary" type="submit">
          {t("pools.addLiquidity.modal.confirmButton")}
        </Button>
      </form>
    </Modal>
  )
}
