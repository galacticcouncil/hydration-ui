import { Button, Flex, Paper, Stack } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { BankCashOutHistory } from "@/modules/onramp/bank/components/BankCashOutHistory"
import { BankDepositHistory } from "@/modules/onramp/bank/components/BankDepositHistory"
import { useHbrDeposits, useHbrRamps } from "@/modules/onramp/bank/hooks/useHbr"
import type { TransferFilter } from "@/modules/onramp/bank/utils/onramp"

const FILTERS: ReadonlyArray<TransferFilter> = [
  "all",
  "inProgress",
  "completed",
  "attention",
]

type BankTransferHistoryProps = {
  h160: string
  onOpenDeposit: (id: string) => void
  onOpenRamp: (id: string) => void
}

/**
 * Portfolio, Deposits: the transfer history (Figma M05) with its filter chips
 * (grouping from the server's status, getTransferGroup) and the empty card.
 * An empty answer is "nothing tracked yet", never proof that nothing was sent
 * (API doc 4).
 */
export const BankTransferHistory: FC<BankTransferHistoryProps> = ({
  h160,
  onOpenDeposit,
  onOpenRamp,
}) => {
  const { t } = useTranslation(["onramp"])
  const [filter, setFilter] = useState<TransferFilter>("all")
  const deposits = useHbrDeposits(h160)
  const ramps = useHbrRamps(h160)
  const empty =
    !!deposits.data &&
    !!ramps.data &&
    deposits.data.deposits.length === 0 &&
    deposits.data.unattributed.length === 0 &&
    ramps.data.ramps.length === 0 &&
    ramps.data.unlinkedRedeems.length === 0

  if (empty)
    return (
      <Paper data-transfers-empty="1">
        <EmptyState
          header={t("bank.history.emptyTitle")}
          description={t("bank.history.emptyDescription")}
        />
      </Paper>
    )

  return (
    <Stack gap="l">
      <Flex gap="s" wrap>
        {FILTERS.map((key) => (
          <Button
            key={key}
            size="small"
            variant={filter === key ? "secondary" : "muted"}
            data-filter={key}
            data-active={filter === key ? "1" : "0"}
            onClick={() => setFilter(key)}
          >
            {t(`bank.history.filter.${key}`)}
          </Button>
        ))}
      </Flex>
      <BankDepositHistory h160={h160} onOpen={onOpenDeposit} filter={filter} />
      <BankCashOutHistory h160={h160} onOpen={onOpenRamp} filter={filter} />
    </Stack>
  )
}
