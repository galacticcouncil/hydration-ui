import { Button, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { parseUnits } from "viem"

import { type WithdrawalRow } from "@/modules/strategies/bil/components/Withdrawals.columns"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import {
  useCancelRedeem,
  useClaim,
  useInstantRedeemFromQueue,
} from "@/modules/strategies/bil/hooks/useVaultWrites"

export type WithdrawalRowActionsProps = {
  row: WithdrawalRow
}

export const WithdrawalRowActions: React.FC<WithdrawalRowActionsProps> = ({
  row,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { bil } = useBilStrategy()

  const cancelMutation = useCancelRedeem()
  const claimMutation = useClaim()
  const instantRedeemMutation = useInstantRedeemFromQueue()

  const claimable = row.claimableBil ?? "0"

  const run =
    (action: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      action()
    }

  return (
    <Flex justify="flex-end" align="center" gap="base">
      {Big(claimable).gt(0) && (
        <Button
          variant="primary"
          size="small"
          onClick={run(() =>
            claimMutation.mutate(parseUnits(claimable, bil.decimals)),
          )}
          disabled={claimMutation.isPending}
        >
          {t("common:claim")}
        </Button>
      )}
      <Button
        variant="secondary"
        size="small"
        onClick={run(() =>
          instantRedeemMutation.mutate({
            requestId: row.id,
            bilAmount: row.amountBil,
          }),
        )}
        disabled={instantRedeemMutation.isPending || cancelMutation.isPending}
      >
        {t("bil.withdrawals.action.instant")}
      </Button>
      <Button
        variant="tertiary"
        size="small"
        onClick={run(() => cancelMutation.mutate(row.id))}
        disabled={cancelMutation.isPending}
      >
        {t("common:cancel")}
      </Button>
    </Flex>
  )
}
