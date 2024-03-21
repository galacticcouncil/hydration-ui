import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { Icon } from "components/Icon/Icon"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Search } from "components/Search/Search"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SAssetsModalHeader } from "sections/assets/AssetsModal.styled"
import {
  SELECTABLE_PARACHAINS_IDS,
  TExternalAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { AssetRow } from "sections/wallet/addToken/modal/AddTokenModal.styled"
import { SourceFilter } from "sections/wallet/addToken/modal/filter/SourceFilter"
import { AddTokenListSkeleton } from "sections/wallet/addToken/modal/skeleton/AddTokenListSkeleton"

const DEFAULT_PARACHAIN_ID = SELECTABLE_PARACHAINS_IDS[0]

type Props = {
  onAssetSelect?: (asset: TExternalAsset) => void
  onCustomAssetClick?: () => void
  search: string
  setSearch: (search: string) => void
}

export const AddTokenListModal: React.FC<Props> = ({
  onAssetSelect,
  onCustomAssetClick,
  search,
  setSearch,
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const [parachainId, setParachainId] = useState(DEFAULT_PARACHAIN_ID)

  const { data, isLoading } = useExternalAssetRegistry()
  const { isAdded } = useUserExternalTokenStore()

  const externalAssets = data?.[parachainId] ?? []
  const internalAssets = assets.tokens.filter(
    (asset) => asset.parachainId === parachainId.toString(),
  )

  const filteredExternalAssets = externalAssets.filter((asset) => {
    const isDOT = asset.symbol === "DOT"
    if (isDOT) return false

    const isChainStored = internalAssets.some(
      (internalAsset) => internalAsset.generalIndex === asset.id,
    )
    if (isChainStored) return false

    const isUserStored = isAdded(asset.id)
    if (isUserStored) return false

    const isSearched = search.length
      ? asset.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        asset.symbol.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      : true

    return isSearched
  })

  return (
    <>
      <Search
        value={search}
        setValue={setSearch}
        css={{ margin: "0 20px 4px" }}
        placeholder={t("wallet.header.search")}
        autoFocus
      />
      <SourceFilter value={parachainId} onChange={setParachainId} />
      {search.length && !filteredExternalAssets.length ? (
        <EmptySearchState css={{ margin: "24px 0" }} />
      ) : (
        <>
          <SAssetsModalHeader>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("wallet.addToken.header.availableAssets")}
            </Text>
          </SAssetsModalHeader>
          <ModalScrollableContent
            sx={{
              maxHeight: ["100%", 480],
              pr: 0,
              width: "100%",
            }}
            content={
              isLoading ? (
                <AddTokenListSkeleton />
              ) : (
                <>
                  {filteredExternalAssets.map((asset) => (
                    <AssetRow
                      key={asset.id}
                      onClick={() =>
                        onAssetSelect?.({ ...asset, origin: parachainId })
                      }
                    >
                      <Text
                        fs={14}
                        sx={{ flex: "row", align: "center", gap: 10 }}
                      >
                        <Icon icon={<AssetLogo />} size={24} />
                        {asset.name}
                      </Text>
                    </AssetRow>
                  ))}
                </>
              )
            }
          />
        </>
      )}
    </>
  )
}
