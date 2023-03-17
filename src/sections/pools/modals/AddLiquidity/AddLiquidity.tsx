import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Controller, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { useApiPromise } from "utils/api"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { BN_10 } from "utils/constants"
import { useStore } from "state/store"
import { u32 } from "@polkadot/types"
import { FormValues } from "utils/helpers"
import { useAddLiquidity, useVerifyCap } from "./AddLiquidity.utils"
import { getFixedPointAmount } from "utils/balance"
import { AddLiquidityLimitWarning } from "sections/pools/modals/AddLiquidity/AddLiquidityLimitWarning"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"

type Props = {
  pool: OmnipoolPool
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddLiquidity = ({ pool, isOpen, onClose, onSuccess }: Props) => {
  const [assetId, setAssetId] = useState<u32 | string>(pool?.id.toString())
  const [assetValue, setAssetValue] = useState("")
  const {
    openModal,
    modal,
    isOpen: isOpenSelectAssetModal,
  } = useAssetsModal({
    onSelect: setAssetId,
  })

  const { calculatedShares, spotPrice, omnipoolFee, assetMeta, assetBalance } =
    useAddLiquidity(assetId, assetValue)

  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{ amount: string }>({
    mode: "onChange",
  })
  const amountIn = form.watch("amount")

  const isWithinLimit = useVerifyCap({
    assetId: assetId.toString(),
    amount: amountIn,
    decimals: assetMeta?.decimals.toNumber() ?? 12,
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta?.decimals == null) throw new Error("Missing asset meta")

    const amount = getFixedPointAmount(
      values.amount,
      assetMeta.decimals.toNumber(),
    ).toString()

    return await createTransaction(
      {
        tx: api.tx.omnipool.addLiquidity(assetId, amount),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: assetMeta?.symbol,
                shares: calculatedShares,
                fixedPointScale: assetMeta?.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onSuccess"
              tOptions={{
                value: values.amount,
                symbol: assetMeta?.symbol,
                shares: calculatedShares,
                fixedPointScale: assetMeta?.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: assetMeta?.symbol,
                shares: calculatedShares,
                fixedPointScale: assetMeta?.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <Modal
      open={isOpen}
      withoutOutsideClose
      title={t("liquidity.add.modal.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      {isOpenSelectAssetModal ? (
        modal
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
          sx={{
            flex: "column",
            justify: "space-between",
            height: "100%",
            mt: 10,
          }}
        >
          <div sx={{ flex: "column" }}>
            <Controller
              name="amount"
              control={form.control}
              rules={{
                required: t("wallet.assets.transfer.error.required"),
                validate: {
                  validNumber: (value) => {
                    try {
                      if (!new BigNumber(value).isNaN()) return true
                    } catch {}
                    return t("error.validNumber")
                  },
                  positive: (value) =>
                    new BigNumber(value).gt(0) || t("error.positive"),
                  maxBalance: (value) => {
                    try {
                      if (assetMeta?.decimals == null)
                        throw new Error("Missing asset meta")
                      if (
                        assetBalance?.balance.gte(
                          BigNumber(value).multipliedBy(
                            BN_10.pow(assetMeta?.decimals.toNumber()),
                          ),
                        )
                      )
                        return true
                    } catch {}
                    return t("liquidity.add.modal.validation.notEnoughBalance")
                  },
                  minPoolLiquidity: (value) => {
                    try {
                      if (assetMeta?.decimals == null)
                        throw new Error("Missing asset meta")

                      const minimumPoolLiquidity =
                        api.consts.omnipool.minimumPoolLiquidity.toBigNumber()

                      const amount = BigNumber(value).multipliedBy(
                        BN_10.pow(assetMeta?.decimals.toNumber()),
                      )

                      if (amount.gte(minimumPoolLiquidity)) return true
                    } catch {}
                    return t("liquidity.add.modal.validation.minPoolLiquidity")
                  },
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
                  error={error?.message}
                  onAssetOpen={openModal}
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
                {t("liquidity.add.modal.lpFee")}
              </Text>
              <Text fs={14} color="white">
                {t("value.percentage", { value: omnipoolFee?.fee })}
              </Text>
            </div>

            <Text
              color="pink500"
              fs={15}
              font="FontOver"
              tTransform="uppercase"
            >
              {t("liquidity.add.modal.positionDetails")}
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
                {t("liquidity.remove.modal.price")}
              </Text>
              <Text fs={14} color="white">
                {t("liquidity.add.modal.row.spotPrice", {
                  firstAmount: 1,
                  firstCurrency: assetMeta?.symbol,
                  secondAmount: spotPrice?.spotPrice,
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
                {t("liquidity.add.modal.receive")}
              </Text>
              <Text fs={14} color="white">
                {t("value", {
                  value: calculatedShares,
                  fixedPointScale: assetMeta?.decimals.toString(),
                  type: "token",
                })}
              </Text>
            </div>
            <Separator color="darkBlue401" />
            <Text
              color="warningOrange200"
              fs={14}
              fw={400}
              sx={{ mt: 17, mb: 24 }}
            >
              {t("liquidity.add.modal.warning")}
            </Text>

            {isWithinLimit.data === false && <AddLiquidityLimitWarning />}

            <PoolAddLiquidityInformationCard />

            <Separator
              color="darkBlue401"
              sx={{ mx: "-30px", my: 20, width: "auto" }}
            />
          </div>
          <Button variant="primary" type="submit" disabled={true}>
            {t("liquidity.add.modal.confirmButton")}
          </Button>
        </form>
      )}
    </Modal>
  )
}
