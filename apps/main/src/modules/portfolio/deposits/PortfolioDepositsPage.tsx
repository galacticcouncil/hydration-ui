import { ArrowDownToLineIcon, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Input,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { EmptyState } from "@/components/EmptyState"
import { BankPortfolio } from "@/modules/onramp/bank/components/BankPortfolio"
import { BankTransferHistory } from "@/modules/onramp/bank/components/BankTransferHistory"
import { BankWalkthrough } from "@/modules/onramp/bank/components/BankWalkthrough"
import {
  BankEntry,
  useBankEntryStore,
} from "@/modules/onramp/bank/store/useBankEntryStore"
import { isBankFlowEnabled } from "@/modules/onramp/bank/utils/bankAvailability"
import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

import { PortfolioBankSetupSample } from "./PortfolioBankSetupSample"
import { PortfolioDepositClaims } from "./PortfolioDepositClaims"
import { PortfolioDepositPreview } from "./PortfolioDepositPreview"
import { PortfolioRecoveryCards } from "./PortfolioRecoveryCards"
import { PortfolioTransferHistory } from "./PortfolioTransferHistory"

export const PortfolioDepositsPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(["common", "onramp"])
  const { account } = useAccount()
  const pending = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )
  const [search, setSearch] = useState("")
  const { depositStatus = "all", bankDemo } = useSearch({
    from: "/portfolio/deposits",
  })
  const historyProps = {
    search,
    filter: depositStatus,
    filterTo: "/portfolio/deposits" as const,
  }
  const [samples, setSamples] = useState(
    import.meta.env.VITE_PORTFOLIO_SAMPLES === "1",
  )

  const open = (entry: BankEntry) => {
    useBankEntryStore.getState().open(entry)
    const deposit = entry.direction === "deposit"
    useOnrampStore
      .getState()
      .paginateTo(
        deposit ? OnrampScreen.DepositBank : OnrampScreen.WithdrawBank,
      )
    void navigate({ to: deposit ? "/deposit" : "/withdraw" })
  }

  return (
    <Flex direction="column" gap="xl">
      <Flex
        align={["stretch", null, "center"]}
        direction={["column", null, "row"]}
        justify="space-between"
        gap="base"
      >
        <Flex align="center" gap="s">
          <Icon
            component={ArrowDownToLineIcon}
            size="l"
            color="text.high"
            aria-hidden
          />
          <Text as="h1" font="primary" fs="h7" fw={500} color="text.high">
            {t("navigation.portfolioDeposits.title")}
          </Text>
        </Flex>
        <Flex align="center" gap="m">
          <Input
            iconStart={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("onramp:deposit.portfolio.search")}
            aria-label={t("onramp:deposit.portfolio.search")}
            width={["100%", null, "4xl"]}
          />
          <Button asChild variant="secondary">
            <Link to="/deposit">{t("navigation.deposit.title")}</Link>
          </Button>
        </Flex>
      </Flex>
      {account && isBankFlowEnabled() && (
        <BankPortfolio
          onOpen={open}
          history={(h160) => (
            <BankTransferHistory
              h160={h160}
              onOpenDeposit={(id) =>
                open({
                  direction: "deposit",
                  target: { kind: "deposit", id },
                })
              }
              onOpenRamp={(id) =>
                open({ direction: "withdraw", target: { kind: "ramp", id } })
              }
            />
          )}
        />
      )}
      {import.meta.env.VITE_PORTFOLIO_SAMPLES === "1" && (
        <Stack gap="s">
          <Flex align="center" justify="space-between">
            <Text as="h2" fs="p3" fw={500} color="text.high">
              Demo activity
            </Text>
            <Button
              size="small"
              variant="secondary"
              aria-expanded={samples}
              onClick={() => setSamples(!samples)}
            >
              {samples ? "Hide demo activity" : "Show demo activity"}
            </Button>
          </Flex>
          {samples && (
            <Stack gap="m">
              <Flex gap="s" wrap>
                <Button size="small" variant="secondary" asChild>
                  <Link
                    to="/portfolio/deposits"
                    search={(prev) => ({ ...prev, bankDemo: "deposit" })}
                  >
                    Try bank deposit
                  </Link>
                </Button>
                <Button size="small" variant="secondary" asChild>
                  <Link
                    to="/portfolio/deposits"
                    search={(prev) => ({ ...prev, bankDemo: "withdraw" })}
                  >
                    Try bank withdrawal
                  </Link>
                </Button>
              </Flex>
              {!account && <PortfolioBankSetupSample />}
              <PortfolioDepositPreview {...historyProps} />
            </Stack>
          )}
        </Stack>
      )}
      {import.meta.env.VITE_PORTFOLIO_SAMPLES === "1" && bankDemo && (
        <BankWalkthrough
          key={bankDemo}
          direction={bankDemo}
          onClose={() =>
            void navigate({
              to: "/portfolio/deposits",
              search: (prev) => ({ ...prev, bankDemo: undefined }),
              replace: true,
            })
          }
        />
      )}
      {!account ? (
        <Paper>
          <EmptyState
            header={t("deposits.disconnected")}
            description={t("deposits.connect")}
            action={<Web3ConnectButton variant="secondary" />}
          />
        </Paper>
      ) : (
        <>
          {pending.length > 0 && (
            <Stack as={Paper} p="l" gap="m">
              <Text as="h2" fs="p3" fw={500} color="text.high">
                {t("onramp:deposit.cex.transfer.ongoing.title")}
              </Text>
              {pending.map((deposit) => (
                <PendingDeposit
                  key={deposit.id}
                  {...deposit}
                  onContinue={() => void navigate({ to: "/deposit" })}
                />
              ))}
            </Stack>
          )}
          <PortfolioRecoveryCards address={account.address} />
          <PortfolioDepositClaims />
          <PortfolioTransferHistory {...historyProps} />
        </>
      )}
    </Flex>
  )
}
