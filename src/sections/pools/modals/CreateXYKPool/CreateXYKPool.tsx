import { useGetXYKPools } from "api/xyk"
import { useMemo, useState } from "react"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { CreateXYKPoolForm } from "./CreateXYKPoolForm"
import {
  CreateXYKPoolFormData,
  createPoolExclusivityMap,
  filterIdsByExclusivity,
  useAllowedXYKPoolAssets,
  useCreateXYKPoolForm,
} from "./CreateXYKPoolForm.utils"
import { UseFormReturn } from "react-hook-form"
import { TAsset } from "api/assetDetails"

type CreateXYKPoolProps = {
  controlledForm?: UseFormReturn<CreateXYKPoolFormData>
  defaultAssetA?: string
  defaultAssetB?: string
  submitHidden?: boolean
  onTxClose?: () => void
  onAssetAOpen?: () => void
  onAssetBOpen?: () => void
  onAssetASelect?: (asset: TAsset) => void
  onAssetBSelect?: (asset: TAsset) => void
  onAssetSelectClose?: () => void
  children: (props: {
    form: JSX.Element
    assetsA: JSX.Element
    assetsB: JSX.Element
  }) => JSX.Element
}

export const CreateXYKPool = ({
  controlledForm,
  defaultAssetA = "",
  defaultAssetB = "",
  submitHidden,
  onTxClose,
  onAssetAOpen,
  onAssetBOpen,
  onAssetASelect,
  onAssetBSelect,
  onAssetSelectClose,
  children,
}: CreateXYKPoolProps) => {
  const { data: xykPools } = useGetXYKPools()

  const allowedAssets = useAllowedXYKPoolAssets()
  const allowedAssetIds = allowedAssets.map(({ id }) => id)

  const poolExclusivityMap = useMemo(
    () => createPoolExclusivityMap(xykPools?.map(({ assets }) => assets) ?? []),
    [xykPools],
  )

  const [assetA, setAssetA] = useState(defaultAssetA)
  const [assetB, setAssetB] = useState(defaultAssetB)

  const allowedAssetsA = useMemo(
    () => filterIdsByExclusivity(assetB, allowedAssetIds, poolExclusivityMap),
    [assetB, allowedAssetIds, poolExclusivityMap],
  )

  const allowedAssetsB = useMemo(
    () => filterIdsByExclusivity(assetA, allowedAssetIds, poolExclusivityMap),
    [assetA, allowedAssetIds, poolExclusivityMap],
  )

  const defaultForm = useCreateXYKPoolForm(assetA, assetB)

  const form = (
    <CreateXYKPoolForm
      form={controlledForm || defaultForm}
      onClose={onTxClose}
      onAssetAOpen={onAssetAOpen}
      onAssetBOpen={onAssetBOpen}
      assetA={assetA}
      assetB={assetB}
      submitHidden={submitHidden}
    />
  )

  const assetsA = (
    <AssetsModalContent
      allowedAssets={allowedAssetsA}
      allAssets
      withBonds
      withExternal
      hideInactiveAssets
      onSelect={(asset) => {
        setAssetA(asset.id)
        onAssetASelect?.(asset)
        onAssetSelectClose?.()
      }}
    />
  )

  const assetsB = (
    <AssetsModalContent
      allowedAssets={allowedAssetsB}
      allAssets
      withBonds
      withExternal
      hideInactiveAssets
      onSelect={(asset) => {
        setAssetB(asset.id)
        onAssetBSelect?.(asset)
        onAssetSelectClose?.()
      }}
    />
  )

  return children({
    form,
    assetsA,
    assetsB,
  })
}
