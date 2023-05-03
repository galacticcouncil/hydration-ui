import { ReactComponent as IconWarning } from "assets/icons/WarningIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const AddLiquidityLimitWarning = ({
  type,
  limit,
}: {
  type: "cap" | "circuitBreaker"
  limit?: { value?: string; symbol?: string }
}) => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        flex: "row",
        align: "center",
        gap: 8,
        height: 50,
        p: "12px 14px",
        mb: 8,
      }}
      css={{ borderRadius: 2, background: "rgba(245, 168, 85, 0.3)" }}
    >
      <IconWarning />
      <Text color="white" fs={13} fw={400}>
        {t(`liquidity.add.modal.warningLimit.${type}`, {
          amount: limit?.value,
          symbol: limit?.symbol,
        })}
      </Text>
    </div>
  )
}
