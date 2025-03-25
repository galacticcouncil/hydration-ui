import {
  AssetInput,
  AssetInputProps,
  Button,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import Flamingo from "public/images/Flamingo.webp"
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

  const assetPrices = useAssetsPrice(selectedAsset ? [selectedAsset.id] : [])
  const assetPrice = selectedAsset?.id ? assetPrices[selectedAsset?.id] : null
  const assetPriceValue = assetPrice?.price || "0"
  const assetPriceLoading = assetPrice?.isLoading

  const price =
    assetPriceValue === "NaN"
      ? "NaN"
      : new Big(assetPriceValue).times(props.value || "0").toString()

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
