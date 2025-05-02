import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { useExternalAssetRegistry } from "@/api/external"
import { AssetLabelFull, AssetSelectModalOption } from "@/components"
import { useUserExternalTokenStore } from "@/modules/wallet/assets/AddToken/AddToken.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { TExternalAsset } from "@/utils/externalAssets"

type Props = {
  readonly parachainId: number
  readonly searchPhrase: string
  readonly className?: string
  readonly onSelect: (asset: TExternalAsset) => void
}

export const AddTokenAssetList: FC<Props> = ({
  parachainId,
  searchPhrase,
  className,
  onSelect,
}) => {
  const { t } = useTranslation("wallet")
  const { tokens, external, externalInvalid, getAsset } = useAssets()

  const assetRegistry = useExternalAssetRegistry(useRpcProvider())
  const { isAdded } = useUserExternalTokenStore()

  const selectedParachain = assetRegistry[parachainId]

  const externalAssets = selectedParachain?.data
    ? Array.from(selectedParachain.data.values())
    : []

  const internalAssetsMap = new Set(
    tokens
      .filter((asset) => asset.type === AssetType.TOKEN)
      .filter((asset) => asset.parachainId === parachainId.toString())
      .map((asset) => asset.externalId),
  )

  const registeredAssetsMap = new Set(
    [...external, ...externalInvalid]
      .filter((asset) => asset.parachainId === parachainId.toString())
      .map((asset) => asset.externalId),
  )

  const filteredExternalAssets = externalAssets.filter((asset) => {
    if (
      asset.symbol === "DOT" ||
      internalAssetsMap.has(asset.id) ||
      registeredAssetsMap.has(asset.id) ||
      isAdded(asset.id)
    ) {
      return false
    }

    const search = searchPhrase.trim().toLowerCase()

    return search
      ? asset.name.toLocaleLowerCase().includes(search) ||
          asset.symbol.toLocaleLowerCase().includes(search) ||
          asset.id.includes(search)
      : true
  })

  return (
    <Flex direction="column" gap={10} className={className}>
      <Text
        fs={12}
        transform="uppercase"
        color={getToken("text.low")}
        bg={getToken("details.borders")}
        sx={{ px: "var(--modal-content-padding)" }}
      >
        {t("addToken.modal.availableAssets")}
      </Text>
      <Flex direction="column" gap={10} sx={{ overflowY: "auto", flex: 1 }}>
        {filteredExternalAssets.map((asset) => {
          const assetMetadata = getAsset(asset.id)

          if (!assetMetadata) {
            return null
          }

          return (
            <AssetSelectModalOption
              key={asset.id}
              onClick={() => onSelect?.({ ...asset, origin: parachainId })}
            >
              <AssetLabelFull asset={assetMetadata} />
            </AssetSelectModalOption>
          )
        })}
      </Flex>
    </Flex>
  )
}
