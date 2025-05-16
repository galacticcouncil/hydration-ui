import {
  Button,
  Flex,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSwitcher } from "@/components/AssetSwitcher"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scale, scaleHuman } from "@/utils/formatting"

import {
  calculateRate,
  useSubmitCreateIsolatedPool,
  zodCreateIsolatedPool,
} from "./CreateIsolatedPool.utils"

export type CreateIsolatedPoolFormData = {
  amountA: string
  amountB: string
}

export const CreateIsolatedPool = () => {
  const { t } = useTranslation("liquidity")
  const { tradable } = useAssets()
  const { getBalance } = useAccountBalances()
  const [assetA, setAssetA] = useState<TAssetData | undefined>(undefined)
  const [assetB, setAssetB] = useState<TAssetData | undefined>(undefined)
  const [isReversedPrice, setIsReversedPrice] = useState(false)

  const { assetABalance, assetBBalance } = useMemo(() => {
    const balanceA = assetA ? getBalance(assetA?.id)?.free : undefined
    const balanceB = assetB ? getBalance(assetB?.id)?.free : undefined

    return {
      assetABalance:
        balanceA && assetA
          ? scaleHuman(balanceA, assetA.decimals).toString()
          : "0",
      assetBBalance:
        balanceB && assetB
          ? scaleHuman(balanceB, assetB.decimals).toString()
          : "0",
    }
  }, [assetA, assetB, getBalance])

  const form = useForm<CreateIsolatedPoolFormData>({
    mode: "onChange",
    resolver: standardSchemaResolver(
      zodCreateIsolatedPool(assetABalance, assetBBalance, assetA, assetB),
    ),
    defaultValues: {
      amountA: "",
      amountB: "",
    },
  })

  const { mutate: submitCreateIsolatedPool } = useSubmitCreateIsolatedPool()

  const [amountA, amountB] = form.watch(["amountA", "amountB"])

  const rate = calculateRate({
    amountA,
    amountB,
    assetA,
    assetB,
    reversed: isReversedPrice,
  })

  const onSwitchAssets = () => {
    setAssetA(assetB)
    setAssetB(assetA)
    setIsReversedPrice(false)
  }

  const onSubmit = (values: CreateIsolatedPoolFormData) => {
    if (assetA && assetB) {
      submitCreateIsolatedPool({
        assetA,
        assetB,
        amountA: scale(values.amountA, assetA.decimals),
        amountB: scale(values.amountB, assetB.decimals),
      })
    }
  }

  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open>
        <ModalHeader
          title={t("liquidity.createPool.modal.title")}
          closable={false}
        />
        <ModalBody>
          <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="amountA"
              control={form.control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <AssetSelect
                  label={t("liquidity.createPool.modal.assetA")}
                  value={value}
                  onChange={onChange}
                  assets={tradable}
                  selectedAsset={assetA}
                  setSelectedAsset={(asset) => setAssetA(asset)}
                  error={error?.message}
                  disabled={!assetA}
                  maxBalance={assetABalance}
                />
              )}
            />

            <AssetSwitcher
              onSwitchAssets={onSwitchAssets}
              disabled={!rate}
              onPriceClick={() => setIsReversedPrice((prev) => !prev)}
              price={
                rate
                  ? t("liquidity.createPool.modal.rate", {
                      assetA: rate.assetA,
                      assetB: rate.assetB,
                      value: rate.rate.toString(),
                    })
                  : t("liquidity.createPool.modal.rate.placeholder")
              }
            />

            <Controller
              name="amountB"
              control={form.control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <AssetSelect
                  label={t("liquidity.createPool.modal.assetB")}
                  value={value}
                  onChange={onChange}
                  assets={tradable}
                  selectedAsset={assetB}
                  setSelectedAsset={(asset) => setAssetB(asset)}
                  error={error?.message}
                  maxBalance={assetBBalance}
                  disabled={!assetB}
                />
              )}
            />

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={!form.formState.isValid}
            >
              {t("liquidity.createPool.modal.title")}
            </Button>
          </form>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}
