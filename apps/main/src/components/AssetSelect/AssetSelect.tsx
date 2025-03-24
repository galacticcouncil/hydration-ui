import {
  AssetInput,
  AssetInputProps,
  Button,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import Flamingo from "public/Flamingo.webp"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelectModal, Logo } from "@/components"
import { useAssetsPrice } from "@/states/displayAsset"

type AssetSelectProps = Omit<AssetInputProps, "dollarValue"> & {
  assets: TAssetData[]
  selectedAsset: TAssetData | undefined | null
  setSelectedAsset?: (asset: TAssetData) => void
}

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <Flex
      direction="column"
      align="center"
      gap={12}
      m="auto"
      pb={50}
      maxWidth={230}
    >
      <img src={Flamingo} loading="lazy" alt="Empty state" width={96} />
      <Text color={getToken("text.high")} fs={14} lh={1.2} fw={500}>
        {t("assetSelector.empty.mainText")}
      </Text>
      <Text
        color={getToken("text.medium")}
        fs={12}
        lh={1.2}
        fw={400}
        align="center"
      >
        {t("assetSelector.empty.secondaryText")}
      </Text>
      <Button variant="secondary" sx={{ mt: 8 }}>
        {t("assetSelector.empty.btn.addAsset")}
      </Button>
    </Flex>
  )
}

export const AssetSelect = ({
  assets,
  selectedAsset,
  setSelectedAsset,
  ...props
}: AssetSelectProps) => {
  const [openModal, setOpeModal] = useState(false)

  const { getAssetPrice, isLoading: assetPriceLoading } = useAssetsPrice(
    selectedAsset ? [selectedAsset.id] : [],
  )
  const assetPrice = selectedAsset ? getAssetPrice(selectedAsset.id) : null

  const price = assetPrice
    ? new Big(assetPrice.price).times(props.value || "0").toString()
    : "NaN"

  return (
    <>
      <AssetInput
        {...props}
        onAsssetBtnClick={() => setOpeModal(true)}
        selectedAssetIcon={
          selectedAsset ? <Logo id={selectedAsset.id} /> : undefined
        }
        symbol={selectedAsset?.symbol}
        modalDisabled={!setSelectedAsset}
        dollarValue={price}
        dollarValueLoading={assetPriceLoading}
      />

      <AssetSelectModal
        open={openModal}
        assets={assets}
        onOpenChange={setOpeModal}
        onSelect={setSelectedAsset}
        emptyState={<EmptyState />}
      />
    </>
  )
}
