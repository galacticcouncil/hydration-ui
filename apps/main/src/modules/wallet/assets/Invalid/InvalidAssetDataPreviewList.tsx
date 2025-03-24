import { HelpIcon, Warning } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  ModalContentDivider,
  TransactionListItem,
  TransactionListItemLabel,
  TransactionListItemValue,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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
      <TransactionListItem
        label={t("invalidAsset.modal.symbol")}
        value={asset?.symbol}
      />
      <ModalContentDivider />
      <TransactionListItem
        label={t("invalidAsset.modal.assetId")}
        value={asset?.id}
      />
      <ModalContentDivider />
      <TransactionListItem
        customLabel={
          <TransactionListItemLabel>
            <HelpIcon />
            {t("invalidAsset.modal.hydraRegistered")}
          </TransactionListItemLabel>
        }
        customValue={
          <TransactionListItemValue variant="success">
            {t("common:yes")}
          </TransactionListItemValue>
        }
      />
      <ModalContentDivider />
      <TransactionListItem
        customLabel={
          <TransactionListItemLabel>
            <HelpIcon />
            {t("invalidAsset.modal.availableOnOtherChains")}
          </TransactionListItemLabel>
        }
        value={3}
      />
      <ModalContentDivider />
      <TransactionListItem
        customLabel={
          <TransactionListItemLabel>
            <HelpIcon />
            {t("invalidAsset.modal.masterKeyExisting")}
          </TransactionListItemLabel>
        }
        customValue={
          <TransactionListItemValue variant="error">
            {t("common:yes")}
            <Warning />
          </TransactionListItemValue>
        }
      />
      <ModalContentDivider />
      <TransactionListItem
        label={t("invalidAsset.modal.isolatedPoolCreated")}
        customValue={
          <TransactionListItemValue variant="success">
            {t("common:yes")}
          </TransactionListItemValue>
        }
      />
      <ModalContentDivider />
      <TransactionListItem
        label={t("invalidAsset.modal.dailyVolume")}
        value={t("common:currency", { value: 1244455 })}
      />
      <ModalContentDivider />
    </Flex>
  )
}
