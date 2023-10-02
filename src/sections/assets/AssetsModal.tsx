import { u32 } from "@polkadot/types"
import { TAsset, useAcountAssets } from "api/assetDetails"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { Maybe } from "utils/helpers"
import { Text } from "components/Typography/Text/Text"
import { SAssetsModalHeader } from "./AssetsModal.styled"
import { AssetsModalRow } from "./AssetsModalRow"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { Input } from "components/Input/Input"
import { useState } from "react"

type Props = {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (asset: NonNullable<TAsset>) => void
  hideInactiveAssets?: boolean
  allAssets?: boolean
}

export const AssetsModalContent = ({
  allowedAssets,
  onSelect,
  hideInactiveAssets,
  allAssets,
}: Props) => {
  const { t } = useTranslation()
  const { assets, isLoaded } = useRpcProvider()
  const { account } = useAccountStore()
  const [search, setSearch] = useState("")

  const assetsRows = useAcountAssets(account?.address)

  const assetsDetails = (
    allAssets ? assets.tokens : assetsRows.filter((asset) => asset.isToken)
  ).filter((asset) =>
    search
      ? asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  const mainAssets =
    allowedAssets != null
      ? assetsDetails.filter((asset) => allowedAssets.includes(asset.id))
      : assetsDetails

  const otherAssets =
    allowedAssets != null
      ? assetsDetails.filter((asset) => !allowedAssets?.includes(asset.id))
      : []

  if (!isLoaded)
    return (
      <>
        <SAssetsModalHeader>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.asset")}
          </Text>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.your_balance")}
          </Text>
        </SAssetsModalHeader>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <AssetsModalRowSkeleton key={n} />
        ))}
      </>
    )

  return (
    <>
      <div sx={{ p: 24 }}>
        <Input
          value={search}
          onChange={setSearch}
          name="search"
          label="x"
          placeholder={t("selectAssets.search")}
        />
      </div>
      <SAssetsModalHeader>
        <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
          {t("selectAssets.asset")}
        </Text>
        <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
          {t("selectAssets.your_balance")}
        </Text>
      </SAssetsModalHeader>
      {mainAssets?.length ? (
        mainAssets.map((asset) => (
          <AssetsModalRow
            key={asset.id}
            id={asset.id}
            onClick={(assetData) => onSelect?.(assetData)}
          />
        ))
      ) : (
        <Text color="whiteish500" sx={{ textAlign: "center", p: 20 }}>
          {t("selectAssets.empty")}
        </Text>
      )}
      {!hideInactiveAssets && !!otherAssets?.length && (
        <>
          <SAssetsModalHeader shadowed>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.asset_without_pair")}
            </Text>
          </SAssetsModalHeader>
          {otherAssets?.map((asset) => (
            <AssetsModalRow key={asset.id} id={asset.id} />
          ))}
        </>
      )}
    </>
  )
}
