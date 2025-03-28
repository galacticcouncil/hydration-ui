import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { Button } from "components/Button/Button"
import { ModalHorizontalSeparator } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"
import { theme } from "theme"

type Props = {
  readonly onClose: () => void
}

export const ClaimStrategyModal: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation()

  return (
    <div css={{ display: "grid", rowGap: 16 }}>
      <div
        sx={{ flex: "column", gap: 3, px: 20, pt: 8, pb: 16 }}
        css={{ background: "#9EA7BA0F" }}
      >
        <Text fw={500} fs={16} color="brightBlue300" sx={{ py: 10 }}>
          {t("wallet.strategy.claim.assetToReceive")}
        </Text>
        <Separator />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            py: 12,
          }}
        >
          <AssetTableName id={GIGADOT_ASSET_ID} />
          <div sx={{ flex: "column", align: "flex-end" }}>
            <Text fw={500} fs={18} lh="1.3" color="white">
              0.01 DOT
            </Text>
            <Text fs={12} lh="1.4" css={{ color: "#FFFFFF44" }}>
              $0.01
            </Text>
          </div>
        </div>
      </div>
      <div
        sx={{ flex: "row", justify: "space-between", py: 4 }}
        css={{ borderBottom: `1px solid ${theme.colors.darkBlue400}` }}
      >
        <Text fw={500} fs={14} color="basic400">
          {t("wallet.strategy.deposit.minReceived")}
        </Text>
        <Text fw={500} fs={14} color="white">
          ≈ 233 DOT
        </Text>
      </div>
      <ModalHorizontalSeparator />
      <Button variant="primary">{t("confirm")}</Button>
    </div>
  )
}
