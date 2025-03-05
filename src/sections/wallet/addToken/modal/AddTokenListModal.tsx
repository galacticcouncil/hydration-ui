import { useMemo } from "react"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { Icon } from "components/Icon/Icon"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Search } from "components/Search/Search"
import { Text } from "components/Typography/Text/Text"
import { useShallow } from "hooks/useShallow"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { SAssetsModalHeader } from "sections/assets/AssetsModal.styled"
import {
  TExternalAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { AssetRow } from "sections/wallet/addToken/modal/AddTokenModal.styled"
import { SourceFilter } from "sections/wallet/addToken/modal/filter/SourceFilter"
import { AddTokenListSkeleton } from "sections/wallet/addToken/modal/skeleton/AddTokenListSkeleton"
import { useExternalAssetsMetadata, useSettingsStore } from "state/store"
import { theme } from "theme"
import { ExternalAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssets } from "providers/assets"

type Props = {
  onAssetSelect?: (asset: TExternalAsset) => void
  onCustomAssetClick?: () => void
  search: string
  setSearch: (search: string) => void
  parachainId: number
  setParachainId: (id: number) => void
}

export const AddTokenListModal: React.FC<Props> = ({
  onAssetSelect,
  onCustomAssetClick,
  search,
  setSearch,
  parachainId,
  setParachainId,
}) => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const { tokens, external, externalInvalid } = useAssets()
  const degenMode = useSettingsStore(useShallow((s) => s.degenMode))

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const chains = useExternalAssetsMetadata(useShallow((state) => state.chains))
  const { isAdded } = useUserExternalTokenStore()

  const externalAssets = chains?.[parachainId] ?? []

  const { registeredAssetsMap, internalAssetsMap } = useMemo(() => {
    const internalAssets =
      tokens.filter((asset) => asset.parachainId === parachainId.toString()) ??
      []

    const internalAssetsMap = new Map(
      internalAssets.map((asset) => [asset.externalId, asset]),
    )

    const registeredAssets =
      [...external, ...externalInvalid].filter(
        (asset) => asset.parachainId === parachainId.toString(),
      ) ?? []

    const registeredAssetsMap = new Map(
      registeredAssets.map((asset) => [asset.externalId, asset]),
    )

    return {
      registeredAssetsMap,
      internalAssetsMap,
    }
  }, [external, externalInvalid, parachainId, tokens])

  const filteredExternalAssets = externalAssets.filter((asset) => {
    const isDOT = asset.symbol === "DOT"
    if (isDOT) return false

    const isChainStored = !!internalAssetsMap.get(asset.id)
    if (isChainStored) return false

    const isRegistered = !!registeredAssetsMap.get(asset.id)
    if (degenMode && isRegistered) {
      return false
    }

    const isUserStored = isAdded(asset.id)
    if (isUserStored) return false

    const isSearched = search.length
      ? asset.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        asset.symbol.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        asset.id.toString().includes(search)
      : true

    return isSearched
  })

  return (
    <>
      <Search
        value={search}
        setValue={setSearch}
        css={{ margin: `0 ${isDesktop ? 20 : 12}px 4px` }}
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
              !isLoaded ? (
                <AddTokenListSkeleton />
              ) : (
                <>
                  {filteredExternalAssets.map((asset) => (
                    <AssetRow
                      key={asset.id}
                      onClick={() => {
                        onAssetSelect?.({ ...asset, origin: parachainId })
                      }}
                    >
                      <Icon
                        icon={
                          <ExternalAssetLogo
                            id={asset.id}
                            parachainId={asset.origin}
                            originHidden
                          />
                        }
                        size={24}
                      />
                      <div sx={{ minWidth: 0 }}>
                        <Text fs={14} font="GeistSemiBold">
                          {asset.symbol}
                        </Text>
                        <Text fs={12} color="basic500">
                          {asset.name}
                        </Text>
                      </div>
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
