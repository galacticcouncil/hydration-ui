import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Modal, ModalScrollableContent } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { AddLiquidityLimitWarning } from "sections/pools/modals/AddLiquidity/AddLiquidityLimitWarning"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { getFixedPointAmount } from "utils/balance"
import { BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useAddLiquidity, useVerifyLimits } from "./AddLiquidity.utils"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { useRpcProvider } from "providers/rpcProvider"
import { useDebounce } from "react-use"

type Props = {
  pool: OmnipoolPool
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddLiquidity = ({ pool, isOpen, onClose, onSuccess }: Props) => {
  const [assetId, setAssetId] = useState<u32 | string>(pool?.id.toString())
  const [assetValue, setAssetValue] = useState("")

  const { calculatedShares, spotPrice, omnipoolFee, assetMeta, assetBalance } =
    useAddLiquidity(assetId, assetValue)

  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{ amount: string }>({ mode: "onChange" })

  const amountIn = form.watch("amount")

  const [, cancel] = useDebounce(() => setAssetValue(amountIn), 300, [amountIn])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [])

  const { data: limits } = useVerifyLimits({
    assetId: assetId.toString(),
    amount: amountIn,
    decimals: assetMeta.decimals,
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta?.decimals == null) throw new Error("Missing asset meta")

    const amount = getFixedPointAmount(
      values.amount,
      assetMeta.decimals,
    ).toString()

    return await createTransaction(
      { tx: api.tx.omnipool.addLiquidity(assetId, amount) },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        onClose,
        onBack: () => {},
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

  const { page, direction, next, back } = useModalPagination()

  return (
    <Modal
      open={isOpen}
      disableCloseOutside
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={() => {
          onClose()
          form.reset()
        }}
        onBack={back}
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            content: (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="off"
                sx={{
                  flex: "column",
                  justify: "space-between",
                  minHeight: "100%",
                }}
              >
                <ModalScrollableContent
                  content={
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
                                      BN_10.pow(assetMeta.decimals),
                                    ),
                                  )
                                )
                                  return true
                              } catch {}
                              return t(
                                "liquidity.add.modal.validation.notEnoughBalance",
                              )
                            },
                            minPoolLiquidity: (value) => {
                              try {
                                if (assetMeta?.decimals == null)
                                  throw new Error("Missing asset meta")

                                const minimumPoolLiquidity =
                                  api.consts.omnipool.minimumPoolLiquidity.toBigNumber()

                                const amount = BigNumber(value).multipliedBy(
                                  BN_10.pow(assetMeta.decimals),
                                )

                                if (amount.gte(minimumPoolLiquidity))
                                  return true
                              } catch {}
                              return t(
                                "liquidity.add.modal.validation.minPoolLiquidity",
                              )
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
                            onChange={onChange}
                            asset={assetId}
                            error={error?.message}
                            onAssetOpen={next}
                          />
                        )}
                      />
                      <SummaryRow
                        label={t("liquidity.add.modal.lpFee")}
                        content={t("value.percentage", {
                          value: omnipoolFee?.fee.multipliedBy(100),
                        })}
                      />
                      <Spacer size={24} />
                      <Text
                        color="pink500"
                        fs={15}
                        font="FontOver"
                        tTransform="uppercase"
                      >
                        {t("liquidity.add.modal.positionDetails")}
                      </Text>
                      <Summary
                        rows={[
                          {
                            label: t("liquidity.remove.modal.price"),
                            content: (
                              <Text fs={14} color="white" tAlign="right">
                                <Trans
                                  t={t}
                                  i18nKey="liquidity.add.modal.row.spotPrice"
                                  tOptions={{
                                    firstAmount: 1,
                                    firstCurrency: assetMeta?.symbol,
                                  }}
                                >
                                  <DisplayValue value={spotPrice?.spotPrice} />
                                </Trans>
                              </Text>
                            ),
                          },
                          {
                            label: t("liquidity.add.modal.receive"),
                            content: t("value", {
                              value: calculatedShares,
                              fixedPointScale: assetMeta?.decimals.toString(),
                              type: "token",
                            }),
                          },
                        ]}
                      />
                      <Text
                        color="warningOrange200"
                        fs={14}
                        fw={400}
                        sx={{ mt: 17, mb: 24 }}
                      >
                        {t("liquidity.add.modal.warning")}
                      </Text>

                      {limits?.cap === false ? (
                        <AddLiquidityLimitWarning type="cap" />
                      ) : limits?.circuitBreaker.isWithinLimit === false ? (
                        <AddLiquidityLimitWarning
                          type="circuitBreaker"
                          limit={{
                            value: limits?.circuitBreaker.maxValue,
                            symbol: assetMeta?.symbol,
                          }}
                        />
                      ) : null}
                      <PoolAddLiquidityInformationCard />
                      <Spacer size={20} />
                    </div>
                  }
                  footer={
                    <>
                      <Separator
                        color="darkBlue401"
                        sx={{
                          mx: "calc(-1 * var(--modal-content-padding))",
                          mb: 20,
                          width: "auto",
                        }}
                      />
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={
                          limits?.cap === false ||
                          !form.formState.isValid ||
                          !limits?.circuitBreaker.isWithinLimit
                        }
                      >
                        {t("liquidity.add.modal.confirmButton")}
                      </Button>
                    </>
                  }
                />
              </form>
            ),
          },
          {
            title: t("selectAsset.title"),
            content: (
              <AssetsModalContent
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  back()
                }}
              />
            ),
            noPadding: true,
            headerVariant: "FontOver",
          },
        ]}
      />
    </Modal>
  )
}
