import { ArrowDownToLineIcon, Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Input, Stack, Text } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankSetupResume } from "@/modules/ramp/BankSetupResume"

import { PortfolioDepositClaims } from "./PortfolioDepositClaims"
import {
  PortfolioTransferHistory,
  PortfolioTransferHistoryProps,
} from "./PortfolioTransferHistory"

type PortfolioDepositsSectionProps = Pick<
  PortfolioTransferHistoryProps,
  "filter" | "filterTo"
> & { embedded?: boolean }

export const PortfolioDepositsSection: FC<PortfolioDepositsSectionProps> = ({
  filter,
  filterTo,
  embedded = false,
}) => {
  const { t } = useTranslation("onramp")
  const { account } = useAccount()
  const [search, setSearch] = useState("")

  if (!account) return null

  return (
    <Stack
      gap={["l", "xl"]}
      pb={embedded ? "0" : "xxl"}
      as="section"
      aria-labelledby="portfolio-deposits-title"
    >
      <Flex
        direction={["column", null, "row"]}
        align={["stretch", null, "center"]}
        justify="space-between"
        gap={["s", "m"]}
      >
        <Flex align="center" gap="s">
          <Icon component={ArrowDownToLineIcon} size="l" aria-hidden />
          <Text
            id="portfolio-deposits-title"
            as={embedded ? "h2" : "h1"}
            font="primary"
            fs="h7"
            fw={500}
            color="text.high"
          >
            {t("deposit.portfolio.title")}
          </Text>
        </Flex>
        <Input
          iconStart={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("deposit.portfolio.search")}
          aria-label={t("deposit.portfolio.search")}
          width={["100%", null, "4xl"]}
        />
      </Flex>
      <BankSetupResume />
      <PortfolioDepositClaims />
      <PortfolioTransferHistory
        search={search}
        filter={filter}
        filterTo={filterTo}
      />
    </Stack>
  )
}
