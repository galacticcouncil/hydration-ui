import { ReactComponent as IconWarning } from "assets/icons/WarningIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const AddLiquidityLimitWarning = () => {
  const { t } = useTranslation()

  return (
    <div
      sx={{ flex: "row", align: "center", gap: 8, height: 50, p: "12px 14px" }}
      css={{ borderRadius: 2, background: "rgba(245, 168, 85, 0.3)" }}
    >
      <IconWarning />
      <Text color="white" fs={13} fw={400}>
        {t("pools.addLiquidity.modal.warningLimit")}
      </Text>
    </div>
  )
}
