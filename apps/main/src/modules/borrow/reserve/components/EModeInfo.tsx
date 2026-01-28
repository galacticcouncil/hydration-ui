import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

type EModeInfoProps = {
  reserve: ComputedReserveData
}

export const EModeInfo: React.FC<EModeInfoProps> = ({ reserve }) => {
  const { t } = useTranslation(["common", "borrow"])
  return (
    <>
      <ValueStats
        size="small"
        font="secondary"
        wrap
        label={t("borrow:emode.category")}
        value={reserve.eModeLabel}
      />

      <Stack direction="row" gap="xxxl" sx={{ mt: 20 }}>
        <ValueStats
          size="small"
          wrap
          font="secondary"
          label={t("borrow:maxLTV")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLtv) * 100,
          })}
        />
        <ValueStats
          size="small"
          wrap
          font="secondary"
          label={t("borrow:risk.liquidationThreshold")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLiquidationThreshold) * 100,
          })}
        />
        <ValueStats
          size="small"
          wrap
          font="secondary"
          label={t("borrow:risk.liquidationPenalty")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLiquidationBonus) * 100,
          })}
        />
      </Stack>
    </>
  )
}
