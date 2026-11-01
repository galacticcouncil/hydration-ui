import {
  Alert,
  Button,
  ExternalLink,
  Flex,
  Separator,
  Spinner,
  Stack,
  Stepper,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNow } from "@galacticcouncil/utils"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DISCORD_INVITE_LINK } from "@/config/links"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { DepositClaimAction } from "@/modules/onramp/deposit/components/DepositClaimAction"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import {
  getDepositExpectedDuration,
  getDepositReceivedAsset,
  getDepositTiming,
  getDepositTokenProvenance,
} from "@/modules/onramp/deposit/preview/DepositTransfer.utils"
import { useDepositProgress } from "@/modules/onramp/deposit/preview/useDepositProgress"
import {
  SubmittedDeposit,
  useDepositJourneyStore,
} from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { getJourneyExplorerLink } from "@/modules/xcm/history/utils/journey"
import { BRIDGE_LABEL, BRIDGE_TIME } from "@/modules/xcm/transfer/utils/bridge"

type DepositTransferProgressProps = { submitted: SubmittedDeposit }

export const DepositTransferProgress: FC<DepositTransferProgressProps> = ({
  submitted,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const {
    journey,
    isError,
    refetch,
    claimable,
    readyToClaim,
    arrived,
    failed,
    timedOut,
  } = useDepositProgress(submitted)
  const now = useNow(arrived ? null : 1000)
  const estimate = submitted.bridgeTag
    ? BRIDGE_TIME[submitted.bridgeTag]
    : undefined
  const timing = getDepositTiming(
    submitted.sentAt,
    now.getTime(),
    getDepositExpectedDuration(estimate),
  )
  const delayed =
    !arrived && !claimable && !failed && (timedOut || timing.delayed)
  const actualReceived = arrived ? getDepositReceivedAsset(journey) : undefined
  const receivedSymbol = actualReceived?.symbol ?? submitted.receivedSymbol
  const provenance = getDepositTokenProvenance(submitted.bridgeTag)
  const token = provenance
    ? t(`deposit.v3.token.${provenance}`, { symbol: receivedSymbol })
    : receivedSymbol
  const destinationWallet =
    submitted.destinationProvider &&
    getWallet(submitted.destinationProvider)?.title
  const sourceChain = chainsMap.get(submitted.sourceChainKey)
  const explorer = journey
    ? getJourneyExplorerLink(journey)
    : sourceChain?.explorer
  const stage = arrived ? 3 : readyToClaim ? 2 : 1
  const close = () => useOnrampModal.getState().setModal(null)

  return (
    <>
      <SDepositStepHeader
        title={t(
          arrived
            ? "deposit.flow.tracking.arrived"
            : "deposit.flow.tracking.title",
        )}
        align="center"
        closable
      />
      <DepositScrollBody>
        <Stack gap="l" justify="flex-start">
          <Stack gap="s" justify="flex-start">
            <Text fs="p5" color={getToken("text.medium")}>
              {t(
                arrived && actualReceived
                  ? "deposit.v3.tracking.received"
                  : "deposit.v3.tracking.expected",
              )}
            </Text>
            <Flex gap="m" align="center">
              {!arrived && !failed && <Spinner size="s" />}
              <Text fs="h7" font="primary">
                {t("common:currency", {
                  value:
                    actualReceived?.amount ?? (submitted.receivedAmount || "0"),
                  symbol: token,
                })}
              </Text>
            </Flex>
            {arrived && !actualReceived && (
              <Text fs="p5" color={getToken("text.medium")}>
                {t("deposit.v3.tracking.amountUpdating")}
              </Text>
            )}
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.v3.tracking.sent", {
                amount: submitted.amount,
                symbol: submitted.symbol,
                chain: sourceChain?.name ?? submitted.sourceChainKey,
              })}
            </Text>
          </Stack>
          <Stack gap="s" justify="flex-start">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.v3.amount.receiveTo", { chain: "Hydration" })}
              {destinationWallet && ` · ${destinationWallet}`}
            </Text>
            <DepositAccountButton
              active
              name={
                submitted.destinationName ?? t("deposit.onchain.customAddress")
              }
              address={submitted.destinationAddress}
            />
          </Stack>
          <Separator />
          <Stack
            gap="m"
            justify="flex-start"
            role="status"
            aria-live="polite"
            aria-label={t("deposit.v3.tracking.progress")}
          >
            <Stepper
              compact="auto"
              activeStepIndex={stage}
              steps={[
                t("deposit.v3.tracking.stage.sent"),
                t("deposit.v3.tracking.stage.crossing"),
                t(
                  claimable && !arrived
                    ? "deposit.v3.tracking.stage.claim"
                    : "deposit.v3.tracking.stage.delivered",
                ),
              ]}
            />
            <Text fs="p4" color={getToken("text.medium")}>
              {t(
                arrived
                  ? "deposit.flow.tracking.arrivedDescription"
                  : readyToClaim
                    ? "deposit.v3.tracking.claimReady"
                    : claimable
                      ? "deposit.v3.tracking.claimWaiting"
                      : "deposit.v3.tracking.pendingDescription",
              )}
            </Text>
          </Stack>
          {!arrived && (
            <Stack gap="s" justify="flex-start">
              <Flex justify="space-between" gap="m">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.flow.amount.route")}
                </Text>
                <Text fs="p5">
                  {submitted.bridgeTag
                    ? (BRIDGE_LABEL[submitted.bridgeTag] ?? submitted.bridgeTag)
                    : "XCM"}
                </Text>
              </Flex>
              <Flex justify="space-between" gap="m">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.v3.tracking.typicalTime")}
                </Text>
                <Text fs="p5">
                  {estimate ?? t("deposit.flow.amount.etaUnavailable")}
                </Text>
              </Flex>
              <Flex justify="space-between" gap="m">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.v3.tracking.elapsedLabel")}
                </Text>
                <Text fs="p5">
                  {t("deposit.v3.tracking.elapsed", { value: timing.elapsed })}
                </Text>
              </Flex>
              {timing.remaining !== undefined &&
                timing.remaining > 0 &&
                !claimable && (
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.v3.tracking.remaining", {
                      value: timing.remaining,
                    })}
                  </Text>
                )}
              <Text fs="p6" color={getToken("text.low")}>
                {t("deposit.v3.tracking.estimateNote")}
              </Text>
            </Stack>
          )}
          {failed && (
            <Alert
              variant="error"
              description={submitted.error || t("deposit.flow.tracking.failed")}
            />
          )}
          {delayed && (
            <Alert
              variant="warning"
              title={t("deposit.v3.tracking.delayedTitle")}
              description={t("deposit.v3.tracking.delayedDescription")}
            />
          )}
          {isError && !arrived && (
            <Alert
              variant="warning"
              description={t("deposit.flow.tracking.unavailable")}
            />
          )}
          {claimable && !arrived && journey && (
            <DepositClaimAction
              journey={journey}
              address={submitted.destinationAddress}
            />
          )}
          <Flex gap="m" wrap>
            {explorer && (
              <Button asChild variant="secondary">
                <ExternalLink href={explorer}>
                  {t(
                    journey
                      ? "deposit.flow.tracking.details"
                      : "deposit.v3.tracking.sourceExplorer",
                  )}
                </ExternalLink>
              </Button>
            )}
            {(delayed || failed) && (
              <Button asChild variant="muted">
                <ExternalLink href={DISCORD_INVITE_LINK}>
                  {t("deposit.v3.tracking.support")}
                </ExternalLink>
              </Button>
            )}
            {!arrived && (
              <Button
                variant="muted"
                onClick={() => {
                  void refetch()
                }}
              >
                {t("deposit.flow.assets.refresh")}
              </Button>
            )}
          </Flex>
          {!arrived && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.v3.tracking.canClose")}
            </Text>
          )}
          <Flex gap="m" wrap>
            <Button
              onClick={() => useDepositJourneyStore.getState().depositMore()}
            >
              {t("deposit.flow.tracking.more")}
            </Button>
            {arrived && (
              <>
                <Button variant="secondary" asChild>
                  <Link to="/trade" onClick={close}>
                    {t("deposit.flow.tracking.trade")}
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/liquidity" onClick={close}>
                    {t("deposit.v3.tracking.earn")}
                  </Link>
                </Button>
              </>
            )}
            <Button variant="muted" onClick={close}>
              {t("common:close")}
            </Button>
          </Flex>
        </Stack>
      </DepositScrollBody>
    </>
  )
}
