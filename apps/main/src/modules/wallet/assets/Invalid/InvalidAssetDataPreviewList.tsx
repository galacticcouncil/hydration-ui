import { CircleInfo, Warning } from "@galacticcouncil/ui/assets/icons"
import { Flex, ModalContentDivider } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  TransactionItem,
  TransactionItemLabel,
  TransactionItemValue,
} from "@/components/TransactionItem/TransactionItem"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
}

export const InvalidAssetDataPreviewList: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  return (
    <Flex gap={2} direction="column" justify="space-between">
      <TransactionItem
        label={t("invalidAsset.modal.symbol")}
        value={asset?.symbol}
      />
      <ModalContentDivider />
      <TransactionItem
        label={t("invalidAsset.modal.assetId")}
        value={asset?.id}
      />
      <ModalContentDivider />
      <TransactionItem
        variant="success"
        customLabel={
          <TransactionItemLabel>
            <CircleInfo />
            {t("invalidAsset.modal.hydraRegistered")}
          </TransactionItemLabel>
        }
        value={t("common:yes")}
      />
      <ModalContentDivider />
      <TransactionItem
        customLabel={
          <TransactionItemLabel>
            <CircleInfo />
            {t("invalidAsset.modal.availableOnOtherChains")}
          </TransactionItemLabel>
        }
        value={3}
      />
      <ModalContentDivider />
      <TransactionItem
        customLabel={
          <TransactionItemLabel>
            <CircleInfo />
            {t("invalidAsset.modal.masterKeyExisting")}
          </TransactionItemLabel>
        }
        customValue={
          <TransactionItemValue variant="error">
            {t("common:yes")}
            <Warning />
          </TransactionItemValue>
        }
      />
      <ModalContentDivider />
      <TransactionItem
        variant="success"
        label={t("invalidAsset.modal.isolatedPoolCreated")}
        value={t("common:yes")}
      />
      <ModalContentDivider />
      <TransactionItem
        label={t("invalidAsset.modal.dailyVolume")}
        value={t("common:currency", { value: 1244455 })}
      />
      <ModalContentDivider />
    </Flex>
  )
}
