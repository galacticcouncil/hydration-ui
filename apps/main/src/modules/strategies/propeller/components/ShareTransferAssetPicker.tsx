import {
  Box,
  Flex,
  Input,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Search } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SearchEmptyState } from "@/components/EmptyState"
import { StrategyPositionLabel } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.columns"

import { SShareTransferAssetOption } from "./ShareTransferAssetPicker.styled"

export type ShareTransferAsset = {
  positionId: string
  assetId: string
  symbol: string
  balance: string | null
  /** exact share balance backing the position; the MAX transfer sends this */
  shareBalance?: string | null
}

type ShareTransferAssetPickerProps = {
  assets: ShareTransferAsset[]
  selected: ShareTransferAsset
  onSelect: (asset: ShareTransferAsset) => void
  onBack: () => void
}

export const ShareTransferAssetPicker: FC<ShareTransferAssetPickerProps> = ({
  assets,
  selected,
  onSelect,
  onBack,
}) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const availableAssets = assets.some(
    (asset) => asset.positionId === selected.positionId,
  )
    ? assets
    : [selected, ...assets]
  const filteredAssets = availableAssets.filter((asset) =>
    `${asset.symbol} Juicer`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )

  return (
    <>
      <ModalHeader title={t("selectAsset")} align="center" onBack={onBack} />
      <ModalBody noPadding>
        <Box p="var(--modal-content-padding)" pt={0}>
          <Input
            placeholder={t("search.placeholder.assets")}
            iconStart={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Box>
        <Flex px="var(--modal-content-padding)" pb="s" justify="space-between">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("asset")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("balance")}
          </Text>
        </Flex>
        <Box role="listbox" aria-label={t("selectAsset")}>
          {filteredAssets.map((asset) => (
            <SShareTransferAssetOption
              key={asset.positionId}
              type="button"
              role="option"
              aria-selected={asset.positionId === selected.positionId}
              onClick={() => onSelect(asset)}
            >
              <StrategyPositionLabel
                position={{ ...asset, strategy: "juicer" }}
              />
              <Text fs="p4">
                {asset.balance === null
                  ? "—"
                  : `${t("approx.short")} ${t("number", { value: asset.balance })}`}
              </Text>
            </SShareTransferAssetOption>
          ))}
          {!filteredAssets.length && <SearchEmptyState searchPhrase={search} />}
        </Box>
      </ModalBody>
    </>
  )
}
