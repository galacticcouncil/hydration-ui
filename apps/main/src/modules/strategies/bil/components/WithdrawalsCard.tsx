import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  Label,
  LoadingButton,
  MenuItemLabel,
  MenuSelectionItem,
  Pagination,
  Stack,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, useEvmAddress } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { hoursToMilliseconds } from "date-fns"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { parseUnits } from "viem"

import { PendingPosition } from "@/components/PendingPosition"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useRedemptionQueue } from "@/modules/strategies/bil/hooks/useRedemptionQueue"
import {
  useAutoClaimEnabled,
  useVaultStats,
} from "@/modules/strategies/bil/hooks/useVaultReads"
import {
  useCancelRedeem,
  useClaim,
  useInstantRedeemFromQueue,
  useSetAutoClaim,
} from "@/modules/strategies/bil/hooks/useVaultWrites"

const WITHDRAWALS_PAGE_SIZE = 5

type WithdrawalRow = {
  id: number
  amountBil: string
  estHollar: string
  timeRemainingDays: number
  claimableBil: string
  isSettled: boolean
}

const WithdrawalPosition: FC<{ row: WithdrawalRow }> = ({ row }) => {
  const { t } = useTranslation(["strategies", "common"])
  const { bil } = useBilStrategy()

  const cancelMutation = useCancelRedeem()
  const claimMutation = useClaim()
  const instantRedeemMutation = useInstantRedeemFromQueue()

  const isQueueActionPending =
    instantRedeemMutation.isPending || cancelMutation.isPending

  return (
    <PendingPosition
      assetId={bil.id}
      value={t("common:currency", { value: row.amountBil, symbol: bil.symbol })}
      displayValue={t("common:currency", { value: row.estHollar })}
      stats={
        row.isSettled
          ? undefined
          : [
              {
                label: t("bil.withdrawals.col.timeRemaining"),
                // Zero wait on an unsettled request means its bonds have
                // matured and it is waiting on the issuer's payout.
                value:
                  row.timeRemainingDays > 0
                    ? t("common:interval", {
                        value: hoursToMilliseconds(row.timeRemainingDays * 24),
                        unit: "d",
                      })
                    : t("bil.withdrawals.processing"),
              },
            ]
      }
      status={
        Big(row.claimableBil).gt(0) && (
          <LoadingButton
            variant="secondary"
            size="small"
            loadingMode="replace"
            onClick={() =>
              claimMutation.mutate(parseUnits(row.claimableBil, bil.decimals))
            }
            isLoading={claimMutation.isPending}
            disabled={claimMutation.isPending}
          >
            {t("common:claim")}
          </LoadingButton>
        )
      }
      action={
        !row.isSettled && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="tertiary"
                outline
                size="small"
                sx={{ px: "base" }}
                disabled={isQueueActionPending}
              >
                <Icon component={Ellipsis} size="m" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <MenuSelectionItem
                  variant="filterLink"
                  onClick={() =>
                    instantRedeemMutation.mutate({
                      requestId: row.id,
                      bilAmount: row.amountBil,
                    })
                  }
                >
                  <MenuItemLabel>
                    {t("bil.withdrawals.action.instant")}
                  </MenuItemLabel>
                </MenuSelectionItem>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <MenuSelectionItem
                  variant="filterLink"
                  onClick={() => cancelMutation.mutate(row.id)}
                >
                  <MenuItemLabel>{t("common:cancel")}</MenuItemLabel>
                </MenuSelectionItem>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    />
  )
}

export const WithdrawalsCard = () => {
  const { t } = useTranslation(["strategies", "common"])
  const { isConnected } = useAccount()
  const evmAddress = useEvmAddress()
  const [page, setPage] = useState(1)

  const { data: stats } = useVaultStats()
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: autoClaimOn } = useAutoClaimEnabled(evmAddress)

  const setAutoClaimMutation = useSetAutoClaim()

  const exchangeRate = stats.exchangeRate
  const queue = queueData?.queue

  // Claimable first, then oldest (queue order) first within each group.
  const rows = useMemo(
    () =>
      (queue ?? [])
        .filter((e) => e.isUser)
        .map((e): WithdrawalRow => {
          const isSettled = Big(e.bilRemaining).eq(0)
          return {
            id: e.requestId,
            amountBil: isSettled ? e.bilSettled : e.bilRemaining,
            estHollar: isSettled
              ? e.hollarOwed
              : Big(e.bilRemaining).times(exchangeRate).toString(),
            timeRemainingDays: e.estTimeRemainingDays,
            claimableBil: e.bilSettled,
            isSettled,
          }
        })
        .sort(
          (a, b) =>
            Number(Big(b.claimableBil).gt(0)) -
              Number(Big(a.claimableBil).gt(0)) || a.id - b.id,
        ),
    [queue, exchangeRate],
  )

  if (!isConnected || rows.length === 0) return null

  const totalPages = Math.ceil(rows.length / WITHDRAWALS_PAGE_SIZE)
  const currentPage = Math.min(page, totalPages)
  const pagedRows = rows.slice(
    (currentPage - 1) * WITHDRAWALS_PAGE_SIZE,
    currentPage * WITHDRAWALS_PAGE_SIZE,
  )

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center" wrap gap="m">
          <CardTitle>{t("bil.withdrawals.title")}</CardTitle>
          <Flex align="center" gap="base">
            <Tooltip text={t("bil.withdrawals.autoClaim.tooltip")} asChild>
              <Label
                fs="p5"
                color={getToken("text.medium")}
                htmlFor="auto-claim"
              >
                {t("bil.withdrawals.autoClaim")}
              </Label>
            </Tooltip>
            <Toggle
              size="medium"
              checked={autoClaimOn ?? false}
              onCheckedChange={(next) => setAutoClaimMutation.mutate(next)}
              name="auto-claim"
              disabled={setAutoClaimMutation.isPending}
            />
          </Flex>
        </Flex>
      </CardHeader>
      <Stack gap="m" p="l">
        {pagedRows.map((row) => (
          <WithdrawalPosition key={row.id} row={row} />
        ))}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setPage}
        />
      </Stack>
    </Card>
  )
}
