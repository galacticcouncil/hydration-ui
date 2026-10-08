import {
  Button,
  Flex,
  Paper,
  ProgressBar,
  Separator,
  Stack,
  Text,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  OpenAction,
  OpenActionModal,
} from "@/modules/money-market-v2/actions/ActionModal"
import {
  HealthFactorNumber,
  HF_UNBOUNDED,
} from "@/modules/money-market-v2/HealthFactorNumber"
import {
  useNavigateToReserve,
  useUserAddress,
} from "@/modules/money-market-v2/hooks"
import {
  ACTION_ICONS,
  AmountCell,
  NetApyValue,
  ReadError,
  ReserveAsset,
  SuppliedRow,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { usePositions } from "@/modules/money-market-v2/usePositions"

type Side = "withdraw" | "repay"

/** One side's positions as compact rows, each opening its reserve. */
const PositionList: FC<{
  title: string
  rows: SuppliedRow[]
  empty: string
  action: Side
  onAction: ((open: OpenAction) => void) | undefined
}> = ({ title, rows, empty, action, onAction }) => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const navigateToReserve = useNavigateToReserve()
  const amount = (r: SuppliedRow) =>
    action === "withdraw"
      ? {
          amount: r.position.underlyingBalance,
          usd: r.position.underlyingBalanceUsd,
        }
      : {
          amount: r.position.variableBorrows,
          usd: r.position.variableBorrowsUsd,
        }
  const total = rows.reduce((sum, r) => sum.plus(amount(r).usd), Big(0))

  return (
    <Stack gap="s">
      <Flex justify="space-between" align="center">
        <Text fs="p4" fw={600}>
          {title} ({rows.length})
        </Text>
        <Text fs="p4" fw={600}>
          {t("currency", { value: total.toFixed(), maximumFractionDigits: 2 })}
        </Text>
      </Flex>
      {rows.length === 0 && (
        <Text fs="p5" color={getToken("text.low")}>
          {empty}
        </Text>
      )}
      {rows.map((r) => (
        <Flex
          key={r.reserve.underlyingAsset}
          justify="space-between"
          align="center"
          gap="base"
          py="xs"
          sx={{ cursor: "pointer" }}
          onClick={() => navigateToReserve(r.reserve.underlyingAsset)}
        >
          <ReserveAsset reserve={r.reserve} size="small" />
          <Flex align="center" gap="base">
            <AmountCell {...amount(r)} />
            <Button
              iconStart={ACTION_ICONS[action]}
              variant="tertiary"
              size="small"
              disabled={!onAction}
              onClick={(e) => {
                e.stopPropagation()
                onAction?.({ action, asset: r.reserve.underlyingAsset })
              }}
            >
              {t(`moneyMarket:${action}`)}
            </Button>
          </Flex>
        </Flex>
      ))}
    </Stack>
  )
}

/** The user's standing in the selected market on one card. */
export const PositionPage: FC = () => {
  const { t } = useTranslation(["common", "moneyMarket"])
  const user = useUserAddress()
  const [open, setOpen] = useState<OpenAction | null>(null)
  const {
    account,
    acc,
    isLoading,
    supplied,
    borrowed,
    netApy,
    borrowPowerUsed,
  } = usePositions(user)

  const empty = user ? "None yet." : "Connect a wallet."
  const onAction = user ? setOpen : undefined

  return (
    <Stack gap="xxl">
      <Paper p="xl">
        <Stack gap="xl">
          <Text as="h2" fs="p2" fw={500} font="primary">
            Your position
          </Text>
          <Separator />
          {account.error ? (
            <ReadError error={account.error} />
          ) : (
            <>
              <Flex justify="space-between" align="end" gap="xl" wrap>
                <ValueStats
                  size="medium"
                  label={t("moneyMarket:healthFactor")}
                  isLoading={isLoading}
                  customValue={
                    <ValueStatsValue size="medium">
                      {acc && acc.healthFactor !== HF_UNBOUNDED ? (
                        <HealthFactorNumber value={acc.healthFactor} />
                      ) : (
                        "-"
                      )}
                    </ValueStatsValue>
                  }
                />
                <Flex gap="xxl">
                  {(["netApy", "earnedApy", "debtApy"] as const).map(
                    (figure) => (
                      <ValueStats
                        key={figure}
                        wrap
                        size="small"
                        label={t(`moneyMarket:${figure}`)}
                        isLoading={isLoading}
                        customValue={
                          <ValueStatsValue size="small">
                            <NetApyValue netApy={netApy} figure={figure} />
                          </ValueStatsValue>
                        }
                      />
                    ),
                  )}
                </Flex>
              </Flex>
              <Stack gap="xs">
                <Text fs="p5" color={getToken("text.medium")}>
                  Borrow power used
                </Text>
                <ProgressBar value={borrowPowerUsed * 100} size="small" />
              </Stack>
              <Separator />
              <PositionList
                title="Supplied"
                rows={supplied}
                empty={empty}
                action="withdraw"
                onAction={onAction}
              />
              <Separator />
              <PositionList
                title="Borrowed"
                rows={borrowed}
                empty={empty}
                action="repay"
                onAction={onAction}
              />
            </>
          )}
        </Stack>
      </Paper>
      <OpenActionModal open={open} onClose={() => setOpen(null)} />
    </Stack>
  )
}
