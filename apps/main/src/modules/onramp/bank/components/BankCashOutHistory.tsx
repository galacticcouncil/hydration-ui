import { Stack, Text, TextButton } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankRampLabel } from "@/modules/onramp/bank/components/BankRampLabel"
import { useHbrRamps } from "@/modules/onramp/bank/hooks/useHbr"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type BankCashOutHistoryProps = {
  h160: string
  onOpen: (rampId: string) => void
}

/**
 * GET /v1/ramps: cash-outs, then, apart, redemptions the server has not
 * matched to a cash-out (rule 9). Each shows its label as returned.
 */
export const BankCashOutHistory: FC<BankCashOutHistoryProps> = ({
  h160,
  onOpen,
}) => {
  const { t } = useTranslation(["onramp"])
  const list = useHbrRamps(h160)
  const data = list.data
  if (!data) return null

  return (
    <Stack gap="m">
      {data.ramps.length > 0 && (
        <Stack gap="s">
          <Text fs="p3" fw={500}>
            {t("bank.cashOut.history.title")}
          </Text>
          {data.ramps.map((ramp) => (
            <Stack key={ramp.id} gap="xs" data-ramp-row={ramp.id}>
              <Text fs="p5" color={getToken("text.low")}>
                {t("bank.cashOut.history.amount", {
                  amount: formatUsdcBaseUnits(ramp.usdcAmount) ?? "-",
                })}
              </Text>
              <BankRampLabel h160={h160} ramp={ramp} />
              <TextButton onClick={() => onOpen(ramp.id)}>
                {t("bank.cashOut.history.open")}
              </TextButton>
            </Stack>
          ))}
          {data.truncated && (
            <Text fs="p5" color={getToken("text.low")}>
              {t("bank.cashOut.history.truncated")}
            </Text>
          )}
        </Stack>
      )}
      {data.unlinkedRedeems.length > 0 && (
        <Stack gap="s" data-unlinked-redeems="1">
          <Text fs="p3" fw={500}>
            {t("bank.cashOut.unlinked.title")}
          </Text>
          {data.unlinkedRedeems.map((row) => (
            <Stack key={row.id} gap="xs">
              <Text fs="p4" fw={500}>
                {row.label}
              </Text>
              {row.detail && (
                <Text fs="p5" color={getToken("text.medium")}>
                  {row.detail}
                </Text>
              )}
            </Stack>
          ))}
          {data.unlinkedRedeemsTruncated && (
            <Text fs="p5" color={getToken("text.low")}>
              {t("bank.cashOut.history.truncated")}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  )
}
