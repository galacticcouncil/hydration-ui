import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { getFixedPointAmount } from "utils/balance"
import { BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useStore } from "state/store"
import { OrderAssetSelect } from "./cmp/AssetSelect"
import { OrderAssetRate } from "./cmp/AssetXRate"
import { PartialOrderToggle } from "./cmp/PartialOrderToggle"
import { useRpcProvider } from "providers/rpcProvider"
import { useAssets } from "providers/assets"
import { useAccountBalances } from "api/deposits"
import { useExistentialDepositMultiplier } from "sections/trade/sections/otc/useExistentialDepositorMultiplier"
import { validateOtcExistentialDeposit } from "utils/validators"

type PlaceOrderProps = {
  assetOut?: u32 | string
  assetIn?: u32 | string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const PlaceOrder = ({
  isOpen,
  assetOut,
  assetIn,
  onClose,
  onSuccess,
}: PlaceOrderProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const [aOut, setAOut] = useState(assetOut)
  const [aIn, setAIn] = useState(assetIn)

  const form = useForm<{
    amountOut: string
    amountIn: string
    price: string
    partiallyFillable: boolean
  }>({
    defaultValues: { partiallyFillable: true },
    mode: "onChange",
  })

  const { api } = useRpcProvider()
  const accountAssets = useAccountBalances()
  const assetOutMeta = aOut ? getAssetWithFallback(aOut.toString()) : undefined
  const assetOutBalance = aOut
    ? accountAssets.data?.accountAssetsMap.get(aOut.toString())?.balance
    : undefined
  const assetInMeta = aIn ? getAssetWithFallback(aIn.toString()) : undefined

  useEffect(() => {
    form.trigger()
  }, [aIn, aOut, form])

  const { data: existentialDepositMultiplier } =
    useExistentialDepositMultiplier()

  const { createTransaction } = useStore()

  const handleAmountChange = () => {
    const { amountOut, amountIn, price } = form.getValues()
    if (amountIn && amountOut) {
      const price = new BigNumber(amountIn).div(new BigNumber(amountOut))
      form.setValue("price", price.toFixed())
    } else if (amountIn && price) {
      const amountOut = new BigNumber(amountIn).div(new BigNumber(price))
      form.setValue("amountOut", amountOut.toFixed())
    } else if (amountOut && price) {
      const amountIn = new BigNumber(amountOut).multipliedBy(
        new BigNumber(price),
      )
      form.setValue("amountIn", amountIn.toFixed())
    }
    form.trigger()
  }

  const handlePriceChange = () => {
    const { amountOut, amountIn, price } = form.getValues()
    if (amountOut && price) {
      const amountIn = new BigNumber(amountOut).multipliedBy(
        new BigNumber(price),
      )
      form.setValue("amountIn", amountIn.toFixed())
    } else if (amountIn && price) {
      const amountOut = new BigNumber(amountIn).div(new BigNumber(price))
      form.setValue("amountOut", amountOut.toFixed())
    }
    form.trigger()
  }

  const handleSubmit = async (values: FormValues<typeof form>) => {
    if (assetOutMeta?.decimals == null) throw new Error("Missing assetOut meta")

    if (assetInMeta?.decimals == null) throw new Error("Missing assetIn meta")

    const amountOut = getFixedPointAmount(
      values.amountOut,
      assetOutMeta.decimals,
    ).decimalPlaces(0, 1)

    const amountIn = getFixedPointAmount(
      values.amountIn,
      assetInMeta.decimals,
    ).decimalPlaces(0, 1)

    await createTransaction(
      {
        tx: api.tx.otc.placeOrder(
          aIn!,
          aOut!,
          amountIn.toFixed(),
          amountOut.toFixed(),
          values.partiallyFillable,
        ),
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
              i18nKey="otc.order.place.toast.onLoading"
              tOptions={{
                amount: values.amountOut,
                symbol: assetOutMeta.symbol,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="otc.order.place.toast.onSuccess"
              tOptions={{
                amount: values.amountOut,
                symbol: assetOutMeta.symbol,
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

  const onModalClose = () => {
    onClose()
    form.reset()
  }
  const { page, direction, paginateTo } = useModalPagination()

  return (
    <Modal open={isOpen} disableCloseOutside onClose={onModalClose}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={onModalClose}
        onBack={() => paginateTo(0)}
        contents={[
          {
            title: t("otc.order.place.title"),
            content: (
              <>
                <Text fs={16} color="basic400" sx={{ mb: 22 }}>
                  {t("otc.order.place.desc")}
                </Text>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  autoComplete="off"
                  sx={{
                    flex: "column",
                    justify: "space-between",
                  }}
                >
                  <Controller
                    name="amountOut"
                    control={form.control}
                    rules={{
                      required: true,
                      validate: {
                        existentialDeposit: (value) =>
                          validateOtcExistentialDeposit(
                            assetOutMeta,
                            existentialDepositMultiplier,
                            value || "0",
                          ),
                        maxBalance: (value) => {
                          const balance = assetOutBalance?.transferable
                          const decimals = assetOutMeta?.decimals
                          if (
                            balance &&
                            decimals &&
                            BigNumber(balance).gte(
                              new BigNumber(value).multipliedBy(
                                BN_10.pow(decimals),
                              ),
                            )
                          ) {
                            return true
                          }
                          return t(
                            "otc.order.place.validation.notEnoughBalance",
                          )
                        },
                      },
                    }}
                    render={({
                      field: { name, value, onChange },
                      fieldState: { error },
                    }) => (
                      <OrderAssetSelect
                        title={t("otc.order.place.offerTitle")}
                        name={name}
                        value={value}
                        onChange={(e) => {
                          onChange(e)
                          handleAmountChange()
                        }}
                        onOpen={() => paginateTo(2)}
                        asset={aOut}
                        error={error?.message}
                      />
                    )}
                  />
                  <div sx={{ pt: 10, pb: 10 }}>
                    {assetOutMeta && assetInMeta && (
                      <Controller
                        name="price"
                        control={form.control}
                        render={({ field: { value, onChange } }) => (
                          <OrderAssetRate
                            inputAsset={assetOutMeta.id}
                            outputAsset={assetInMeta.id}
                            price={value!}
                            onChange={(e) => {
                              onChange(e)
                              handlePriceChange()
                            }}
                          />
                        )}
                      />
                    )}
                  </div>

                  <Controller
                    name="amountIn"
                    control={form.control}
                    rules={{
                      required: true,
                      validate: {
                        existentialDepositor: (value) =>
                          validateOtcExistentialDeposit(
                            assetInMeta,
                            existentialDepositMultiplier,
                            value || "0",
                          ),
                        differentFromAmountOut: (value) =>
                          aIn !== aOut ||
                          t("otc.order.place.validation.sameAssets"),
                      },
                    }}
                    render={({
                      field: { name, value, onChange },
                      fieldState: { error },
                    }) => (
                      <OrderAssetSelect
                        title={t("otc.order.place.getTitle")}
                        name={name}
                        value={value}
                        onChange={(e) => {
                          onChange(e)
                          handleAmountChange()
                        }}
                        onOpen={() => paginateTo(1)}
                        asset={aIn}
                        error={error?.message}
                      />
                    )}
                  />

                  <div
                    sx={{
                      mt: 10,
                      mb: 10,
                      flex: "row",
                      justify: "space-between",
                      align: "center",
                    }}
                  >
                    <div>
                      <Text fs={13} color="white">
                        {t("otc.order.place.partial")}
                      </Text>
                      <Text fs={13} color="darkBlue300">
                        {t("otc.order.place.partialDesc")}
                      </Text>
                    </div>

                    <Controller
                      name="partiallyFillable"
                      control={form.control}
                      render={({ field: { value, onChange } }) => (
                        <PartialOrderToggle
                          partial={value}
                          onChange={(e) => onChange(e)}
                        />
                      )}
                    />
                  </div>
                  <Button
                    sx={{ mt: 20 }}
                    variant="primary"
                    disabled={!form.formState.isValid || aIn === aOut}
                  >
                    {t("otc.order.place.confirm")}
                  </Button>
                </form>
              </>
            ),
          },
          {
            title: t("selectAsset.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <AssetsModalContent
                allAssets
                withBonds
                withExternal
                onSelect={(asset) => {
                  setAIn(asset.id)
                  paginateTo(0)
                }}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <AssetsModalContent
                withBonds
                withExternal
                onSelect={(asset) => {
                  form.trigger()
                  setAOut(asset.id)
                  paginateTo(0)
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
