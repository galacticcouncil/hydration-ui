import {
  Amount,
  Flex,
  Grid,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import {
  AssetDetailMobileAction,
  AssetDetailMobileActions,
} from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions"
import { AssetDetailModalBody } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal.styled"
import { AssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal.styled"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { AssetDetailUnlock } from "@/modules/wallet/assets/MyAssets/AssetDetailUnlock"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onActionOpen: (action: AssetDetailMobileAction) => void
}

export const AssetDetailMobileModal: FC<Props> = ({ asset, onActionOpen }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [totalDisplayPrice] = useDisplayAssetPrice(asset.id, asset.total)

  const balance = 2855.24566
  const [balanceDisplayPrice] = useDisplayAssetPrice(asset.id, balance)

  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset.symbol}
        description={asset.name}
      />
      <AssetDetailModalBody>
        <Flex gap={16} direction="column">
          <Flex justify="space-between" align="center">
            <Amount
              label={t("myAssets.header.total")}
              value={asset.total}
              displayValue={totalDisplayPrice}
            />
            <AssetDetailStaking asset={asset} />
          </Flex>
          <AssetDetailMobileActions onActionOpen={onActionOpen} />
          <div>
            <AssetDetailMobileSeparator />
            <Flex py={6} justify="space-between" align="center">
              <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")}>
                {t("common:balances")}
              </Text>
              <Text fw={500} fs="p5" lh={1.4} color={getToken("text.low")}>
                {t("common:amount")}
              </Text>
            </Flex>
            <AssetDetailMobileSeparator />
          </div>

          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.transferableAmount")}
            value={balance}
            displayValue={balanceDisplayPrice}
          />
          <AssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.borrowedAmount")}
            value={balance}
            displayValue={balanceDisplayPrice}
          />
          <AssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInStaking")}
            value={balance}
            displayValue={balanceDisplayPrice}
          />
          <AssetDetailMobileSeparator />
          <Grid
            sx={{
              gridTemplateRows: "auto auto",
              gridTemplateColumns: "1fr auto",
              "& > :nth-child(1)": { gridColumn: "1/-1" },
              "& > :nth-child(2)": { gridColumn: 2 },
            }}
            rowGap={8}
          >
            <Amount
              variant="horizontalLabel"
              label={t("myAssets.expandedNative.unlockable")}
              value={balance}
              displayValue={balanceDisplayPrice}
            />
            <AssetDetailUnlock />
          </Grid>
          <AssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInDemocracy")}
            value={balance}
            displayValue={balanceDisplayPrice}
          />
          <AssetDetailMobileSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInVesting")}
            value={balance}
            displayValue={balanceDisplayPrice}
          />
        </Flex>
      </AssetDetailModalBody>
    </>
  )
}
