import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { AddLiquidityLimitWarning } from "sections/pools/modals/AddLiquidity/AddLiquidityLimitWarning"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { getFixedPointAmount } from "utils/balance"
import { BN_0, BN_1, BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useVerifyLimits } from "../../modals/AddLiquidity/AddLiquidity.utils"
import { PoolAddLiquidityInformationCard } from "../../modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { u8 } from "@polkadot/types"
import { u32 } from "@polkadot/types-codec"
import { BalanceByAsset } from "../../PoolsPage.utils"

type Props = {
  poolId: u32
  asset?: { id: string; symbol: string; decimals: u32 | u8 }
  onSuccess: () => void
  onClose: () => void
  onAssetOpen: () => void
  balanceByAsset?: BalanceByAsset
}

export const AddStablepoolLiquidity = ({
  poolId,
  asset,
  onSuccess,
  onAssetOpen,
  onClose,
  balanceByAsset,
}: Props) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{ amount: string }>({ mode: "onChange" })
  const amountIn = form.watch("amount")

  const { data: limits } = useVerifyLimits({
    assetId: asset?.id as any,
    amount: amountIn,
    decimals: asset?.decimals.toNumber() ?? 12,
  })

  const shares = useStablepoolShares({
    poolId,
    asset: { id: asset?.id, amount: amountIn },
    balanceByAsset,
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (asset?.decimals == null) throw new Error("Missing asset meta")

    const amount = getFixedPointAmount(
      values.amount,
      asset.decimals.toNumber(),
    ).toString()

    return await createTransaction(
      { tx: api.tx.omnipool.addLiquidity(asset.id, amount) },
      {
        onSuccess,
        onSubmitted: () => {
          console.log("--- submittted ---")
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
                symbol: asset?.symbol,
                shares: BN_0,
                fixedPointScale: asset.decimals.toString(),
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
                symbol: asset.symbol,
                shares: BN_0,
                fixedPointScale: asset.decimals.toString(),
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
                symbol: asset?.symbol,
                shares: BN_0,
                fixedPointScale: asset.decimals.toString(),
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
                      if (asset?.decimals == null)
                        throw new Error("Missing asset meta")
                      // TODO:
                      // if (
                      //   assetBalance?.balance.gte(
                      //     BigNumber(value).multipliedBy(
                      //       BN_10.pow(assetMeta?.decimals.toNumber()),
                      //     ),
                      //   )
                      // )
                      return true
                    } catch {}
                    return t("liquidity.add.modal.validation.notEnoughBalance")
                  },
                  minPoolLiquidity: (value) => {
                    try {
                      if (asset?.decimals == null)
                        throw new Error("Missing asset meta")

                      const minimumPoolLiquidity =
                        api.consts.omnipool.minimumPoolLiquidity.toBigNumber()

                      const amount = BigNumber(value).multipliedBy(
                        BN_10.pow(asset?.decimals.toNumber()),
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
                  // onBlur={setAssetValue}
                  onChange={onChange}
                  asset={asset?.id}
                  error={error?.message}
                  onAssetOpen={onAssetOpen}
                />
              )}
            />
            <SummaryRow
              label={t("liquidity.add.modal.tradeFee")}
              content={t("value.percentage", { value: BN_1 })}
              description={t("liquidity.add.modal.tradeFee.description")}
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
                  label: t("liquidity.add.modal.shareTokens"),
                  content: t("value", {
                    value: shares,
                    // fixedPointScale: assetMeta?.decimals.toString(),
                    type: "token",
                  }),
                },
                {
                  label: t("liquidity.remove.modal.price"),
                  content: (
                    <Text fs={14} color="white" tAlign="right">
                      <Trans
                        t={t}
                        i18nKey="liquidity.add.modal.row.spotPrice"
                        tOptions={{
                          firstAmount: 1,
                          firstCurrency: asset?.symbol,
                        }}
                      >
                        {/* TODO: */}
                        {/*<DisplayValue value={spotPrice?.spotPrice} />*/}
                      </Trans>
                    </Text>
                  ),
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
                  symbol: asset?.symbol,
                }}
              />
            ) : null}
            <PoolAddLiquidityInformationCard />
            <Spacer size={20} />
          </div>
        }
        footer={
          <div
            sx={{
              flex: "row",
              justify: "space-between",
              gap: "100px",
              mb: [24, 0],
            }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              sx={{ width: "300px" }}
              variant="primary"
              type="submit"
              disabled={
                limits?.cap === false ||
                !form.formState.isValid ||
                !limits?.circuitBreaker.isWithinLimit
              }
            >
              {t("confirm")}
            </Button>
          </div>
        }
      />
    </form>
  )
}
