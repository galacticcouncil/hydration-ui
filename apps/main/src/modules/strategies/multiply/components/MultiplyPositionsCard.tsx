import {
  Box,
  Button,
  Chip,
  ChipProps,
  Flex,
  LoadingButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Paper,
  PositionCard,
  ProgressBar,
  Separator,
  Stack,
  Text,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useAccountBalances } from "@/api/balances/account.hooks"
import { AssetLogo } from "@/components/AssetLogo"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { MultiplyAmountModal } from "@/modules/strategies/multiply/components/MultiplyAmountModal"
import { Ladder, Stall } from "@/modules/strategies/multiply/config/abi"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import {
  type MultiplyPosition,
  useMultiplyPositions,
} from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { useMultiplyPositionWrites } from "@/modules/strategies/multiply/hooks/useMultiplyPositionWrites"
import {
  getMultiplyPositionStatus,
  getMultiplyProgress,
  isRungExpired,
  type MultiplyPositionStatus,
} from "@/modules/strategies/multiply/utils/status"
import { useAssets } from "@/providers/assetsProvider"

const WAD_DECIMALS = 18
// Aave reports uint256.max when there is no debt.
const NO_DEBT_HF = "-1"

const statusVariant: Record<MultiplyPositionStatus, ChipProps["variant"]> = {
  active: "success",
  building: "info",
  withdrawing: "info",
  closing: "warning",
  paused: "danger",
}

const stallKey = (stall: Stall) => {
  const name = Stall[stall]
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}` as
    | "aaveRefused"
    | "intentRejected"
    | "intentTooSmall"
    | "insufficientHeadroom"
    | "tailUnfunded"
    | "returned"
    | "cancelled"
    | "feeBudgetLow"
}

type ModalKind = "deposit" | "withdraw" | "close"

type MultiplyPositionsCardProps = {
  pair: MultiplyPair
  collateralPriceUsd: number
}

export const MultiplyPositionsCard: React.FC<MultiplyPositionsCardProps> = ({
  pair,
  collateralPriceUsd,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { data: positions } = useMultiplyPositions(pair)
  const writes = useMultiplyPositionWrites(pair)
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const [modal, setModal] = useState<{
    kind: ModalKind
    position: MultiplyPosition
  } | null>(null)

  const collateral = getAssetWithFallback(pair.collateralAssetId)
  const feeAsset = getAssetWithFallback(pair.feeAssetId)
  const debt = getAssetWithFallback(pair.debtAssetId)

  if (!positions?.length) return null

  const amount = (value: bigint) => formatUnits(value, collateral.decimals)
  const leverage = (wad: bigint) => Number(formatUnits(wad, WAD_DECIMALS))

  const stat = (label: string, value: React.ReactNode, bottom?: string) => (
    <ValueStats
      wrap
      size="small"
      font="secondary"
      label={label}
      customValue={
        <Text fs="p3" fw={500} lh={1}>
          {value}
        </Text>
      }
      bottomLabel={bottom}
    />
  )

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("multiply.positions.title")}
        </Text>
      </Box>
      <Separator />
      <Flex direction="column" gap="m" p="m">
        {positions.map((position) => {
          const now = Date.now()
          const status = getMultiplyPositionStatus(position, now)
          const current = leverage(position.aaveLeverage)
          const target = leverage(position.targetLeverage)
          const progress = getMultiplyProgress(status, current, target)
          const nav = Number(amount(position.nav))
          const pnl = Number(amount(position.pnl))
          const principal = Number(amount(position.principal))
          const reason =
            status !== "paused"
              ? null
              : isRungExpired(position, now)
                ? t("multiply.stall.expired")
                : t(`multiply.stall.${stallKey(position.stalled)}`)

          const isBusy = status !== "active" && status !== "paused"
          const canDeposit = position.ladder === Ladder.None
          const hf =
            position.healthFactor >= 2n ** 255n
              ? NO_DEBT_HF
              : formatUnits(position.healthFactor, WAD_DECIMALS)

          const guarded = (
            tooltip: string | null,
            button: React.ReactElement,
          ) =>
            tooltip ? (
              <Tooltip text={tooltip} asChild side="top">
                <Box as="span" sx={{ display: "inline-flex" }}>
                  {button}
                </Box>
              </Tooltip>
            ) : (
              button
            )
          const busyTooltip = isBusy ? t("multiply.positions.busy") : null

          return (
            <PositionCard
              key={position.id.toString()}
              logo={<AssetLogo id={pair.collateralAssetId} size="medium" />}
              symbol={
                <Stack gap="xs">
                  <Flex align="center" gap="s">
                    <Text fs="p3" fw={500} color={getToken("text.high")}>
                      {t("multiply.positions.name", {
                        id: position.id.toString(),
                      })}
                    </Text>
                    <Chip variant={statusVariant[status]} rounded size="small">
                      {t(`multiply.status.${status}`)}
                    </Chip>
                  </Flex>
                  {progress !== null && (
                    <ProgressBar value={progress * 100} size="small" />
                  )}
                  {reason && (
                    <Text fs="p6" color={getToken("accents.danger.emphasis")}>
                      {reason}
                    </Text>
                  )}
                </Stack>
              }
              stats={
                <>
                  {stat(
                    t("multiply.positions.netValue"),
                    t("common:currency", {
                      value: nav,
                      symbol: collateral.symbol,
                    }),
                    t("common:currency", { value: nav * collateralPriceUsd }),
                  )}
                  {stat(
                    t("multiply.positions.pnl"),
                    t("common:currency", {
                      prefix: pnl > 0 ? "+" : "",
                      value: pnl,
                      symbol: collateral.symbol,
                    }),
                    principal > 0
                      ? t("common:percent", { value: (pnl / principal) * 100 })
                      : undefined,
                  )}
                  {stat(
                    t("multiply.positions.leverage"),
                    t("cards.multiply.leverage", { value: current }),
                    t("multiply.positions.target", {
                      value: t("cards.multiply.leverage", { value: target }),
                    }),
                  )}
                  {stat(
                    t("common:healthFactor"),
                    <HealthFactorNumber value={hf} />,
                  )}
                </>
              }
              cta={
                status === "paused" ? (
                  <>
                    <LoadingButton
                      size="small"
                      isLoading={writes.resume.isPending}
                      onClick={() => writes.resume.mutate(position)}
                    >
                      {t("multiply.action.resume")}
                    </LoadingButton>
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => setModal({ kind: "close", position })}
                    >
                      {t("common:close")}
                    </Button>
                  </>
                ) : (
                  <>
                    {guarded(
                      busyTooltip,
                      <Button
                        size="micro"
                        uppercase
                        variant="muted"
                        outline
                        disabled={!canDeposit}
                        onClick={() => setModal({ kind: "deposit", position })}
                      >
                        {t("common:deposit")}
                      </Button>,
                    )}
                    <Flex gap="xs">
                      {guarded(
                        busyTooltip,
                        <Button
                          variant="tertiary"
                          size="small"
                          disabled={isBusy}
                          onClick={() =>
                            setModal({ kind: "withdraw", position })
                          }
                        >
                          {t("common:withdraw")}
                        </Button>,
                      )}
                      {guarded(
                        busyTooltip,
                        <Button
                          variant="tertiary"
                          size="small"
                          disabled={isBusy}
                          onClick={() => setModal({ kind: "close", position })}
                        >
                          {t("common:close")}
                        </Button>,
                      )}
                    </Flex>
                  </>
                )
              }
            />
          )
        })}
      </Flex>

      {modal?.kind === "deposit" && (
        <MultiplyAmountModal
          title={t("multiply.deposit.title", {
            id: modal.position.id.toString(),
          })}
          cta={t("multiply.deposit.cta")}
          asset={collateral}
          max={amount(getTransferableBalance(pair.collateralAssetId))}
          maxLabel={t("common:balance")}
          priceUsd={collateralPriceUsd}
          isPending={writes.deposit.isPending}
          onSubmit={(value) => {
            writes.deposit.mutate({ position: modal.position, amount: value })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "withdraw" && (
        <MultiplyAmountModal
          title={t("multiply.withdraw.title", {
            id: modal.position.id.toString(),
          })}
          cta={t("multiply.withdraw.cta")}
          note={t("multiply.withdraw.note", { symbol: collateral.symbol })}
          asset={collateral}
          max={amount(modal.position.nav)}
          maxLabel={t("multiply.positions.netValue")}
          priceUsd={collateralPriceUsd}
          isPending={writes.withdraw.isPending}
          onSubmit={(value) => {
            writes.withdraw.mutate({ position: modal.position, amount: value })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "close" && (
        <Modal
          variant="popup"
          open
          onOpenChange={() => setModal(null)}
          disableInteractOutside
        >
          <ModalHeader
            title={t("multiply.close.title", {
              id: modal.position.id.toString(),
            })}
          />
          <ModalBody>
            <Stack gap="s">
              <Text fs="p4">{t("multiply.close.description")}</Text>
              <Text fs="p5" color={getToken("text.medium")}>
                •{" "}
                {t("multiply.close.receive.collateral", {
                  symbol: collateral.symbol,
                })}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                • {t("multiply.close.receive.feeBudget")} (
                {t("common:currency", {
                  value: formatUnits(
                    modal.position.feeBudget,
                    feeAsset.decimals,
                  ),
                  symbol: feeAsset.symbol,
                })}
                )
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                • {t("multiply.close.receive.other", { symbol: debt.symbol })}
              </Text>
            </Stack>
          </ModalBody>
          <Separator />
          <ModalFooter>
            <LoadingButton
              size="large"
              width="100%"
              isLoading={writes.close.isPending}
              onClick={() => {
                writes.close.mutate(modal.position)
                setModal(null)
              }}
            >
              {t("multiply.close.cta")}
            </LoadingButton>
          </ModalFooter>
        </Modal>
      )}
    </Paper>
  )
}
