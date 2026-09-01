import {
  Amount,
  Button,
  Grid,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { VaultLiquidityByPool } from "@/modules/wallet/assets/MyLiquidity/MyVaultLiquidity.data"

type Props = {
  readonly detail: VaultLiquidityByPool
  readonly onAddLiquidity: () => void
  readonly onRemoveLiquidity: () => void
}

export const VaultDetailMobileModal: FC<Props> = ({
  detail,
  onAddLiquidity,
  onRemoveLiquidity,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const { meta, vault, shareSymbol, currentValueHuman, currentTotalDisplay } =
    detail

  return (
    <>
      <ModalHeader sx={{ p: 16 }} title={meta.symbol} description={meta.name} />
      <SAssetDetailModalBody>
        <Amount
          value={t("common:currency", {
            value: currentValueHuman,
            symbol: shareSymbol,
          })}
          displayValue={t("common:currency", { value: currentTotalDisplay })}
        />
        <SAssetDetailMobileSeparator />
        <Grid columnGap={8} sx={{ gridTemplateColumns: "1fr 1fr" }}>
          <Button size="large" asChild>
            <Link to="/liquidity/vault/$address" params={{ address: vault.id }}>
              {t("myLiquidity.actions.poolDetails")}
            </Link>
          </Button>
          <Button
            variant="tertiary"
            size="large"
            disabled={!vault.canDeposit}
            onClick={onAddLiquidity}
          >
            {t("myLiquidity.actions.addLiquidity")}
          </Button>
        </Grid>
        <SAssetDetailMobileSeparator />
        <Button variant="tertiary" size="large" onClick={onRemoveLiquidity}>
          {t("myLiquidity.actions.removeLiquidity")}
        </Button>
      </SAssetDetailModalBody>
    </>
  )
}
