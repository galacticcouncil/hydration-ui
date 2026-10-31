import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  HistoryIcon,
  LandmarkIcon,
  WalletIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Chip,
  Flex,
  Icon,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Link, useNavigate } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { EmptyState } from "@/components/EmptyState"
import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"

import { isDepositAccountAddress } from "./PortfolioDepositActivity.utils"

export const PortfolioDepositActivity: FC = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const navigate = useNavigate()
  const deposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )
  const submitted = useDepositJourneyStore((state) => state.submitted)
  const latest =
    submitted &&
    isDepositAccountAddress(submitted.destinationAddress, account?.rawAddress)
      ? submitted
      : null
  const hasActivity = !!deposits.length || !!latest

  const resumeExchangeDeposit = () => {
    useDepositJourneyStore.getState().leave()
    void navigate({ to: "/deposit" })
  }

  const resumeTransfer = () => {
    useOnrampModal.getState().openOnchain("preview", { resume: true })
  }

  return (
    <Stack gap="l" as="section" aria-labelledby="deposit-activity-title">
      <Flex
        direction={["column", "row"]}
        align={["start", "center"]}
        justify="space-between"
        gap="m"
      >
        <Stack gap="s">
          <Text
            as="h2"
            id="deposit-activity-title"
            font="primary"
            fs="h7"
            fw={500}
          >
            {t("deposit.portfolio.activity.title")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.portfolio.activity.description")}
          </Text>
        </Stack>
        <Button size="small" variant="tertiary" asChild>
          <Link to="/cross-chain/history">
            <HistoryIcon size={14} />
            {t("deposit.portfolio.activity.history")}
            <ArrowUpRightIcon size={14} />
          </Link>
        </Button>
      </Flex>

      {!account || !hasActivity ? (
        <Paper px="l">
          <EmptyState
            icon={
              <Icon
                component={account ? ArrowDownLeftIcon : WalletIcon}
                size="xxl"
                color={getToken("icons.onSurface")}
              />
            }
            header={t(
              account
                ? "deposit.portfolio.activity.empty.title"
                : "deposit.portfolio.activity.disconnected.title",
            )}
            description={t(
              account
                ? "deposit.portfolio.activity.empty.description"
                : "deposit.portfolio.activity.disconnected.description",
            )}
            action={!account && <Web3ConnectButton variant="secondary" />}
          />
        </Paper>
      ) : (
        <Stack gap="m">
          {deposits.length > 0 && (
            <Paper p={["l", "xl"]}>
              <Stack gap="l">
                <Flex align="center" gap="s">
                  <LandmarkIcon size={16} />
                  <Text fs="p3" fw={500}>
                    {t("deposit.portfolio.activity.cex")}
                  </Text>
                </Flex>
                <Separator />
                {deposits.map((deposit) => (
                  <PendingDeposit
                    key={deposit.id}
                    {...deposit}
                    onContinue={resumeExchangeDeposit}
                  />
                ))}
              </Stack>
            </Paper>
          )}
          {latest && (
            <Paper p={["l", "xl"]}>
              <Flex
                direction={["column", "row"]}
                align={["stretch", "center"]}
                justify="space-between"
                gap="l"
              >
                <Stack gap="m">
                  <Flex gap="s" align="center" sx={{ flexWrap: "wrap" }}>
                    <ArrowDownLeftIcon size={16} />
                    <Text fs="p3" fw={500}>
                      {t("deposit.portfolio.activity.latest")}
                    </Text>
                    <Chip size="small">
                      {t(
                        latest.settled
                          ? "deposit.portfolio.activity.arrived"
                          : latest.error
                            ? "deposit.portfolio.activity.failed"
                            : "deposit.portfolio.activity.submitted",
                      )}
                    </Chip>
                  </Flex>
                  <Flex
                    gap="m"
                    direction={["column", "row"]}
                    align={["start", "center"]}
                  >
                    <Text fs="h7" font="primary">
                      {t("common:currency", {
                        value: latest.amount,
                        symbol: latest.symbol,
                      })}
                    </Text>
                    <Text fs="p5" color={getToken("text.medium")}>
                      {t("deposit.portfolio.activity.route", {
                        chain:
                          chainsMap.get(latest.sourceChainKey)?.name ??
                          latest.sourceChainKey,
                      })}
                    </Text>
                  </Flex>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("common:date.datetime.short", { value: latest.sentAt })}
                  </Text>
                </Stack>
                <Button variant="secondary" onClick={resumeTransfer}>
                  {t("deposit.portfolio.activity.view")}
                  <ArrowUpRightIcon size={14} />
                </Button>
              </Flex>
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  )
}
