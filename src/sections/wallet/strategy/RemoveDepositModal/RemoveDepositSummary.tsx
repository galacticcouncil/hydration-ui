import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { TAsset } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { theme } from "theme"

type Props = {
  readonly minReceived: string
  readonly assetReceived: TAsset | null
}

export const RemoveDepositSummary: FC<Props> = ({
  minReceived,
  assetReceived,
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <div sx={{ flex: "row", justify: "space-between", py: 4 }}>
        <Text fw={500} fs={14} lh="1" color="basic400">
          {t("wallet.strategy.deposit.minReceived")}
        </Text>
        <Text fw={500} fs={14} lh="1" color="white">
          ≈ {minReceived} {assetReceived?.symbol}
        </Text>
      </div>
      <Separator />
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
        }}
      >
        <Text fw={500} fs={14} lh="1" css={{ color: "#B2B6C5" }}>
          {t("healthFactor")}
        </Text>
        <div sx={{ flex: "column", align: "flex-end" }}>
          <div sx={{ flex: "row", align: "center", gap: 7 }}>
            <Text fw={600} fs={16} lh="1" color="brightBlue300">
              ∞ →{" "}
              <span css={{ color: theme.colors.warningYellow300 }}>1.38%</span>
            </Text>
          </div>
          <Text fw={500} fs={12} lh={16} color="basic500">
            {t("wallet.strategy.remove.liquidationAt", {
              value: "1.0",
            })}
          </Text>
        </div>
      </div>
    </div>
  )
}
