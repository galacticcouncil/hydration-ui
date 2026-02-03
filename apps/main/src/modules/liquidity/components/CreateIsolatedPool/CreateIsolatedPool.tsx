import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useXykPools } from "@/api/pools"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { scale } from "@/utils/formatting"

import {
  CreateIsolatedPoolFormData,
  createPoolExclusivityMap,
  filterIdsByExclusivity,
  useAllowedXYKPoolAssets,
  useIsolatedPoolForm,
  useSubmitCreateIsolatedPool,
} from "./CreateIsolatedPool.utils"

type Props = {
  readonly closable?: boolean
  readonly onBack?: () => void
  readonly onSubmitted: () => void
}

export const CreateIsolatedPool: FC<Props> = ({
  closable,
  onBack,
  onSubmitted,
}) => {
  const { t } = useTranslation("liquidity")

  const form = useIsolatedPoolForm()
  const [assetA, amountA, assetB, amountB] = form.watch([
    "assetA",
    "amountA",
    "assetB",
    "amountB",
  ])

  const { data: xykPools } = useXykPools()
  const poolExclusivityMap = useMemo(
    () =>
      createPoolExclusivityMap(
        xykPools?.map(
          ({ tokens }) =>
            tokens.map((token) => token.id.toString()) as [string, string],
        ) ?? [],
      ),
    [xykPools],
  )

  const allowedAssets = useAllowedXYKPoolAssets()
  const allowedAssetsA = useMemo(
    () => filterIdsByExclusivity(assetB?.id, allowedAssets, poolExclusivityMap),
    [assetB, allowedAssets, poolExclusivityMap],
  )
  const allowedAssetsB = useMemo(
    () => filterIdsByExclusivity(assetA?.id, allowedAssets, poolExclusivityMap),
    [assetA, allowedAssets, poolExclusivityMap],
  )

  const { mutate: submitCreateIsolatedPool } = useSubmitCreateIsolatedPool({
    onSubmitted,
  })

  const onSwitchAssets = () => {
    form.setValue("assetA", assetB)
    form.setValue("assetB", assetA)
    form.trigger()
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
    <FormProvider {...form}>
      <ModalHeader
        title={t("liquidity.createPool.modal.title")}
        closable={closable}
        onBack={onBack}
      />
      <ModalBody scrollable={false}>
        <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
          <AssetSelectFormField<CreateIsolatedPoolFormData>
            assetFieldName="assetA"
            amountFieldName="amountA"
            label={t("liquidity.createPool.modal.assetA")}
            assets={allowedAssetsA}
            disabled={!assetA}
            onAssetChange={() => form.trigger()}
          />

          <AssetSwitcher
            defaultView="reversed"
            assetInId={assetA?.id ?? ""}
            assetOutId={assetB?.id ?? ""}
            priceIn={amountA}
            priceOut={amountB}
            onSwitchAssets={onSwitchAssets}
          />

          <AssetSelectFormField<CreateIsolatedPoolFormData>
            assetFieldName="assetB"
            amountFieldName="amountB"
            label={t("liquidity.createPool.modal.assetB")}
            assets={allowedAssetsB}
            disabled={!assetB}
            onAssetChange={() => form.trigger()}
          />

          <ModalContentDivider />

          <Button
            type="submit"
            size="large"
            width="100%"
            mt="xxl"
            disabled={!form.formState.isValid}
          >
            {t("liquidity.createPool.modal.title")}
          </Button>
        </form>
      </ModalBody>
    </FormProvider>
  )
}
