import { DollarSignIcon, EuroIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  ModalBody,
  ModalFooter,
  Select,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"

type BankDepositPreviewAmountProps = {
  amount: string
  currency: OnrampCurrency
  onAmount: (amount: string) => void
  onCurrency: (currency: OnrampCurrency) => void
  onContinue: () => void
}

function FiatIcon({ currency }: { currency: OnrampCurrency }) {
  return (
    <Flex
      as="span"
      align="center"
      justify="center"
      borderRadius="full"
      bg={getToken("colors.azureBlue.500")}
      sx={{ width: 26, height: 26, flexShrink: 0 }}
    >
      <Icon
        component={currency === "usd" ? DollarSignIcon : EuroIcon}
        size="s"
        color={getToken("colors.azureBlue.900")}
      />
    </Flex>
  )
}

const currencies = [
  { key: "usd", label: "USD", icon: () => <FiatIcon currency="usd" /> },
  { key: "eur", label: "EUR", icon: () => <FiatIcon currency="eur" /> },
] as const

export function BankDepositPreviewAmount({
  amount,
  currency,
  onAmount,
  onCurrency,
  onContinue,
}: BankDepositPreviewAmountProps) {
  const { t } = useTranslation(["onramp"])
  const { gte } = useBreakpoints()
  const desktop = gte("sm")
  const valid = /^\d{1,10}(\.\d{1,2})?$/.test(amount) && Number(amount) >= 1

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
      onSubmit={(event) => {
        event.preventDefault()
        if (valid) onContinue()
      }}
    >
      <ModalBody noPadding>
        <Stack p="var(--modal-content-padding)" gap="base">
          <label htmlFor="sample-bank-deposit-amount">
            <Text as="span" fs="p5" color={getToken("text.medium")}>
              {t("bankV2.deposit.amount")}
            </Text>
          </label>
          <Flex
            align="center"
            gap="m"
            sx={{ "& > button": { pr: "xl", minHeight: 38 } }}
          >
            <Select
              aria-label={t("bankV2.deposit.currency.label")}
              variant="tertiary"
              size="small"
              items={currencies}
              value={currency}
              onValueChange={onCurrency}
            />
            <Box
              flex={1}
              sx={{
                minWidth: 0,
                "& input": {
                  textAlign: "right",
                  fontSize: "p2",
                  fontWeight: 600,
                },
              }}
            >
              <Input
                id="sample-bank-deposit-amount"
                variant="embedded"
                width="100%"
                inputMode="decimal"
                maxLength={13}
                autoComplete="off"
                value={amount}
                onChange={(event) => onAmount(event.target.value)}
                placeholder="0"
                aria-invalid={amount !== "" && !valid}
              />
            </Box>
          </Flex>
          {amount !== "" && !valid && (
            <Text fs="p6" role="status">
              Enter an amount of at least 1 with up to two decimal places.
            </Text>
          )}
        </Stack>
        <Separator />
        <Stack p="var(--modal-content-padding)" gap="base">
          <Text
            font="primary"
            fs="p2"
            color={getToken("textButtons.small.rest")}
          >
            You receive (est.)
          </Text>
          <Flex
            align="center"
            justify="space-between"
            gap="m"
            py="m"
            pl="base"
            pr="m"
            sx={{
              minHeight: 70,
              borderRadius: "m",
              bg: getToken("surfaces.containers.dim.dimOnHigh"),
            }}
          >
            <Flex
              align="center"
              gap="s"
              py="s"
              px="s"
              sx={{
                borderRadius: "full",
                borderWidth: desktop ? 1 : 0,
                borderStyle: "solid",
                borderColor: getToken("details.borders"),
              }}
            >
              <img
                src="/images/bank-hollar.svg"
                width={26}
                height={26}
                alt=""
              />
              <Text fs="p4" fw={600}>
                HOLLAR
              </Text>
            </Flex>
            <Text
              fs="p2"
              fw={600}
              aria-label="Estimated HOLLAR amount"
              sx={{ overflowWrap: "anywhere", textAlign: "right" }}
            >
              {valid ? Number(amount).toLocaleString() : "—"}
            </Text>
          </Flex>
        </Stack>
        <Separator />
        <Box display={["block", "none"]}>
          <Text
            font="primary"
            fs="h7"
            color={getToken("buttons.primary.medium.rest")}
            px="var(--modal-content-padding)"
            py="m"
          >
            Transaction overview
          </Text>
          <Separator />
        </Box>
        <Flex
          align="center"
          justify="space-between"
          gap="m"
          p="var(--modal-content-padding)"
        >
          <Text fs="p5" color={getToken("text.low")}>
            {t("bankV2.deposit.from")}:
          </Text>
          <Text fs="p5">{t("bankV2.deposit.yourBank")}</Text>
        </Flex>
        <Box display={["block", "none"]}>
          <Separator />
        </Box>
        <Stack
          px="var(--modal-content-padding)"
          pt={["l", 0]}
          pb="var(--modal-content-padding)"
          gap="s"
        >
          <Text fs="p5" color={getToken("text.medium")}>
            {t("bankV2.deposit.push")}
          </Text>
          <Text fs="p6" color={getToken("text.low")}>
            Estimate at 1:1. The actual amount can vary with fees and exchange
            rates.
          </Text>
        </Stack>
      </ModalBody>
      <Separator />
      <ModalFooter>
        <Button
          type="submit"
          size="large"
          width="100%"
          disabled={!valid}
          variant={desktop ? "secondary" : "primary"}
        >
          {t("bankV2.deposit.action.continue")}
        </Button>
      </ModalFooter>
    </form>
  )
}
