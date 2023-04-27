import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { usePagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { AddLiquidityLimitWarning } from "sections/pools/modals/AddLiquidity/AddLiquidityLimitWarning"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { getFixedPointAmount } from "utils/balance"
import { BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useAddLiquidity, useVerifyCap } from "./AddLiquidity.utils"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"

type Props = {
  pool: OmnipoolPool
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddLiquidity = ({ pool, isOpen, onClose, onSuccess }: Props) => {
  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<u32 | string>(pool?.id.toString())
  const { page, direction, back, next, reset } = usePagination()

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContents
        page={page}
        direction={direction}
        onBack={back}
        onClose={onClose}
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddLiquidityContent
                assetId={assetId}
                onSuccess={onSuccess}
                onSubmitted={onClose}
                onAssetOpen={next}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "FontOver",
            content: (
              <AssetsModalContent
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  reset()
                }}
              />
            ),
            noPadding: true,
          },
        ]}
      />
    </Modal>
  )
}

type ContentProps = {
  assetId: u32 | string
  onSuccess: () => void
  onSubmitted: () => void
  onAssetOpen: () => void
}

const AddLiquidityContent = ({
  assetId,
  onSuccess,
  onSubmitted,
  onAssetOpen,
}: ContentProps) => {
  const { t } = useTranslation()
  const [assetValue, setAssetValue] = useState("")

  const { calculatedShares, spotPrice, omnipoolFee, assetMeta, assetBalance } =
    useAddLiquidity(assetId, assetValue)

  const api = useApiPromise()
  const { createTransaction } = useStore()
  const form = useForm<{ amount: string }>({ mode: "onChange" })
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
    const tOptions = {
      value: values.amount,
      symbol: assetMeta?.symbol,
      shares: calculatedShares,
      fixedPointScale: assetMeta?.decimals.toString(),
    }

    return await createTransaction(
      {
        tx: api.tx.omnipool.addLiquidity(assetId, amount),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onSubmitted()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={tOptions}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onSuccess"
              tOptions={tOptions}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={tOptions}
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
        height: "100%",
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
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <Spacer size={16} />
        <SummaryRow
          label={t("liquidity.add.modal.lpFee")}
          content={t("value.percentage", { value: omnipoolFee?.fee })}
        />
        <Spacer size={32} />
        <Text color="pink500" fs={15} font="FontOver" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>
        <Summary
          rows={[
            {
              label: t("liquidity.remove.modal.price"),
              content: t("liquidity.add.modal.row.spotPrice", {
                firstAmount: 1,
                firstCurrency: assetMeta?.symbol,
                secondAmount: spotPrice?.spotPrice,
              }),
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
        <Text color="warningOrange200" fs={14} fw={400} sx={{ mt: 16, mb: 24 }}>
          {t("liquidity.add.modal.warning")}
        </Text>

        {isWithinLimit.data === false && <AddLiquidityLimitWarning />}

        <PoolAddLiquidityInformationCard />

        <Separator color="darkBlue401" sx={{ my: 20 }} />
      </div>
      <Button
        variant="primary"
        type="submit"
        disabled={isWithinLimit.data === false || !form.formState.isValid}
      >
        {t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}
