import { XIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { BIL_ERC20_ID, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { hoursToMilliseconds } from "date-fns"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import {
  type WithdrawalColumnHandlers,
  type WithdrawalRow,
  type WithdrawalRowState,
} from "./Withdrawals.columns"

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

type Props = {
  row: WithdrawalRow
} & WithdrawalColumnHandlers

export const WithdrawalRowMobile = ({
  row,
  onCancel,
  isCancelling,
  onClaim,
  isClaiming,
  onInstantRedeem,
  isInstantRedeeming,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const claimable = row.claimableBil ?? 0
  const stillActive = isActive(row.state)
  const showActions = stillActive || claimable > 0

  const timeRemainingValue = (() => {
    if (claimable > 0) {
      return (
        <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
          {t("bil.withdrawals.state.claimable")}
        </Text>
      )
    }
    if (row.state === "fulfilled" || row.state === "cancelled") {
      return (
        <Text fs="p4" color={getToken("text.medium")}>
          {row.state === "fulfilled"
            ? t("bil.withdrawals.state.redeemed")
            : t("bil.withdrawals.state.cancelled")}
        </Text>
      )
    }
    const days = row.timeRemainingDays ?? 0
    return (
      <Text fs="p4" fw={600} color={getToken("accents.alert.primary")}>
        {t("common:interval", {
          value: hoursToMilliseconds(days * 24),
          unit: "d",
        })}
      </Text>
    )
  })()

  return (
    <Paper p="l" shadow={false} bg="dim" borderRadius="l">
      <Flex align="center" justify="space-between" gap="m" wrap>
        <Flex align="center" gap="s" minWidth={0}>
          <AssetLogo id={BIL_ERC20_ID} size="small" />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.amountBil,
              symbol: "BIL",
            })}
          </Text>
        </Flex>
        {showActions && (
          <Flex align="center" justify="flex-end" gap="base" wrap>
            {claimable > 0 && (
              <Button
                variant="primary"
                size="small"
                onClick={() => onClaim(claimable)}
                disabled={isClaiming}
              >
                {t("common:claim")}
              </Button>
            )}
            {stillActive && (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onInstantRedeem(row.id, row.amountBil)}
                  disabled={isInstantRedeeming || isCancelling}
                >
                  {t("bil.withdrawals.action.instant")}
                </Button>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => onCancel(row.id)}
                  disabled={isCancelling}
                >
                  <Text as="span" display={["none", "block"]}>
                    {t("common:cancel")}
                  </Text>
                  <Icon
                    component={XIcon}
                    size="s"
                    display={["block", "none"]}
                  />
                </Button>
              </>
            )}
          </Flex>
        )}
      </Flex>
      <Separator my="m" />
      <Flex justify="space-between" gap="l" align="start" wrap>
        <ValueStats
          wrap
          size="small"
          font="secondary"
          label={t("bil.withdrawals.col.estValue")}
          customValue={
            <Text fs="p4" fw={500} color={getToken("text.high")}>
              {t("common:currency", {
                value: row.estHollar,
                symbol: hollar.symbol,
              })}
            </Text>
          }
          bottomLabel={t("common:currency", {
            value: row.estHollar,
          })}
        />
        <Flex sx={{ textAlign: "right", alignItems: "flex-end" }}>
          <ValueStats
            wrap
            size="small"
            font="secondary"
            label={t("bil.withdrawals.col.timeRemaining")}
            customValue={timeRemainingValue}
          />
        </Flex>
      </Flex>
    </Paper>
  )
}
