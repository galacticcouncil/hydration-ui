import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Summary,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AddLiquidityAlert } from "@/modules/liquidity/components/AddLiquidity/AddLiquidityAlert"
import { PositionDetailsLabel } from "@/modules/liquidity/components/AddLiquidity/PositionDetailsLabel"

type Props = {
  readonly closable?: boolean
}

export const AddIsolatedLiquiditySkeleton: FC<Props> = ({ closable }) => {
  const { t } = useTranslation("liquidity")

  return (
    <>
      <ModalHeader title={t("addLiquidity")} closable={closable} />
      <ModalBody>
        <AssetSelect
          label={t("liquidity.createPool.modal.assetA")}
          disabled
          loading
          assets={[]}
          selectedAsset={undefined}
        />

        <AssetSwitcher
          assetInId=""
          assetOutId=""
          priceIn=""
          priceOut=""
          fallbackPrice=""
          isFallbackPriceLoading
        />

        <AssetSelect
          label={t("liquidity.createPool.modal.assetB")}
          disabled
          loading
          assets={[]}
          selectedAsset={undefined}
        />

        <ModalContentDivider />

        <PositionDetailsLabel />

        <Summary
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("liquidity.add.modal.shareOfPool"),
              content: "",
              loading: true,
            },
            {
              label: t("liquidity.add.modal.receivedAmountOfPoolShares"),
              content: "",
              loading: true,
            },
            {
              label: t("liquidity.add.modal.rewardsFromFees.label"),
              content: "",
              loading: true,
            },
          ]}
        />

        <ModalContentDivider />

        <AddLiquidityAlert />

        <ModalContentDivider />

        <Button
          type="submit"
          size="large"
          width="100%"
          mt={getTokenPx("containers.paddings.primary")}
          disabled
        >
          {t("liquidity.add.modal.submit")}
        </Button>
      </ModalBody>
    </>
  )
}
