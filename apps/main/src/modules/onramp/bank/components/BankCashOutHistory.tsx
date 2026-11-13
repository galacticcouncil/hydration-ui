import {
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  TextButton,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRampLabel } from "@/modules/onramp/bank/components/BankRampLabel"
import { BankStatusPill } from "@/modules/onramp/bank/components/BankStatusPill"
import type { RampView } from "@/modules/onramp/bank/config/schemas"
import { useHbrRamps } from "@/modules/onramp/bank/hooks/useHbr"
import {
  formatUsdcBaseUnits,
  getTransferGroup,
  matchesTransferFilter,
  TransferFilter,
} from "@/modules/onramp/bank/utils/onramp"

type BankCashOutHistoryProps = {
  h160: string
  onOpen: (rampId: string) => void
  /** Portfolio's chip; unmatched redemptions show under All and Needs attention. */
  filter?: TransferFilter
}

const RampRow: FC<{
  h160: string
  ramp: RampView
  onOpen: (id: string) => void
}> = ({ h160, ramp, onOpen }) => {
  const { t } = useTranslation(["onramp"])
  const { label, detail, tone } = useRampLabel(h160, ramp)
  return (
    <Paper p="l" data-ramp-row={ramp.id}>
      <Stack gap="s">
        <Flex justify="space-between" align="center" gap="m">
          <Text fs="p2" fw={500} color={getToken("text.high")}>
            {t("bank.cashOut.history.amount", {
              amount: formatUsdcBaseUnits(ramp.usdcAmount) ?? "-",
            })}
          </Text>
          <Stack data-ramp-label={ramp.id}>
            <BankStatusPill label={label} tone={tone} />
          </Stack>
        </Flex>
        {ramp.createdAt && (
          <Text fs="p5" color={getToken("text.low")}>
            {t("bank.history.receivedAt", { value: new Date(ramp.createdAt) })}
          </Text>
        )}
        {detail && (
          <Text fs="p5" color={getToken("text.medium")}>
            {detail}
          </Text>
        )}
        <Separator />
        <Flex justify="center">
          <TextButton onClick={() => onOpen(ramp.id)}>
            {t("bank.cashOut.history.open")}
          </TextButton>
        </Flex>
      </Stack>
    </Paper>
  )
}

/**
 * GET /v1/ramps as Figma M05 cards: cash-outs, then, apart and titled as
 * such, redemptions the server has not matched to a cash-out (rule 9). Each
 * shows its label as returned (rule 2); a row's Details opens that cash-out
 * in place of this list.
 */
export const BankCashOutHistory: FC<BankCashOutHistoryProps> = ({
  h160,
  onOpen,
  filter = "all",
}) => {
  const { t } = useTranslation(["onramp"])
  const list = useHbrRamps(h160)
  const data = list.data
  if (!data) return null

  return (
    <Stack gap="l">
      <Stack gap="m">
        <Text fs="p3" fw={500}>
          {t("bank.cashOut.history.title")}
        </Text>
        {data.ramps.length === 0 && (
          <Text fs="p5" color={getToken("text.low")}>
            {t("bank.cashOut.history.empty")}
          </Text>
        )}
        {data.ramps
          .filter((ramp) =>
            matchesTransferFilter(
              filter,
              getTransferGroup({ kind: "ramp", tone: ramp.tone }),
            ),
          )
          .map((ramp) => (
            <RampRow key={ramp.id} h160={h160} ramp={ramp} onOpen={onOpen} />
          ))}
        {data.truncated && (
          <Text fs="p5" color={getToken("text.low")}>
            {t("bank.cashOut.history.truncated")}
          </Text>
        )}
      </Stack>
      {(filter === "all" || filter === "attention") &&
        data.unlinkedRedeems.length > 0 && (
          <Paper p="l" data-unlinked-redeems="1">
            <Stack gap="m">
              <Stack gap="xs">
                <Text fs="p3" fw={500}>
                  {t("bank.cashOut.unlinked.title")}
                </Text>
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("bank.cashOut.unlinked.description")}
                </Text>
              </Stack>
              {data.unlinkedRedeems.map((row) => (
                <Stack key={row.id} gap="xs" align="start">
                  <BankStatusPill label={row.label} tone={row.tone} />
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
          </Paper>
        )}
    </Stack>
  )
}
