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
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scale, scaleHuman } from "@/utils/formatting"

import {
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
  const { getFreeBalance } = useAccountBalances()
  const [assetA, setAssetA] = useState<TAssetData | undefined>(undefined)
  const [assetB, setAssetB] = useState<TAssetData | undefined>(undefined)

  const assetABalance = assetA
    ? scaleHuman(getFreeBalance(assetA.id), assetA.decimals)
    : "0"
  const assetBBalance = assetB
    ? scaleHuman(getFreeBalance(assetB.id), assetB.decimals)
    : "0"

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

  const onSwitchAssets = () => {
    setAssetA(assetB)
    setAssetB(assetA)
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
              assetInId={assetA?.id ?? ""}
              assetOutId={assetB?.id ?? ""}
              priceIn={amountA}
              priceOut={amountB}
              onSwitchAssets={onSwitchAssets}
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
