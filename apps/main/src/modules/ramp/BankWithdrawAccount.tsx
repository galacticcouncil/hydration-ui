import {
  Check,
  LandmarkIcon,
  PencilLine,
} from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Chip,
  Flex,
  Grid,
  Icon,
  Input,
  Label,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SStepButton } from "@/modules/onramp/components/StepButton.styled"

import { getDemoWithdrawalBank, WithdrawalCurrency } from "./BankWithdraw.utils"

export type BankWithdrawBankSource = "saved" | "manual"
export type BankWithdrawBankDetails = {
  beneficiary: string
  bank: string
  account: string
  routing: string
}

type BankWithdrawAccountProps = {
  currency: WithdrawalCurrency
  source: BankWithdrawBankSource
  details: BankWithdrawBankDetails
  onSourceChange: (source: BankWithdrawBankSource) => void
  onDetailsChange: (details: BankWithdrawBankDetails) => void
}

export const BankWithdrawAccount: FC<BankWithdrawAccountProps> = ({
  currency,
  source,
  details,
  onSourceChange,
  onDetailsChange,
}) => {
  const { t } = useTranslation("onramp")
  const bank = getDemoWithdrawalBank(currency)
  const fields: (keyof BankWithdrawBankDetails)[] = [
    "beneficiary",
    "bank",
    "account",
    "routing",
  ]
  return (
    <Stack gap={["l", "xl"]}>
      <Stack gap="s">
        <Text fs="p3" fw={500}>
          {t("bankWithdraw.account.choose")}
        </Text>
        <Text fs="p5" color={getToken("text.medium")} lh={1.4}>
          {t("bankWithdraw.account.chooseDescription")}
        </Text>
      </Stack>
      <Stack gap="s">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("bankWithdraw.account.saved")}
        </Text>
        <SStepButton
          aria-pressed={source === "saved"}
          sx={{
            bg: getToken(
              source === "saved" ? "controls.dim.active" : "controls.dim.base",
            ),
          }}
          onClick={() => onSourceChange("saved")}
        >
          <Icon
            component={LandmarkIcon}
            size="l"
            color={getToken("text.tint.secondary")}
          />
          <Stack gap="xs" minWidth={0} flex={1} align="flex-start">
            <Flex align="center" gap="s" wrap>
              <Text fs="p4" fw={500}>
                {t("bankWithdraw.account.demoBank")}
              </Text>
              <Chip rounded variant="green" size="small">
                {t("bankWithdraw.account.confirmed")}
              </Chip>
            </Flex>
            <Text
              fs="p6"
              color={getToken("text.medium")}
              wordBreak="break-word"
            >
              {bank.account} · {t(`bankV2.withdraw.rail.${currency}`)}
            </Text>
          </Stack>
          {source === "saved" && (
            <Icon
              component={Check}
              size="m"
              color={getToken("text.tint.secondary")}
            />
          )}
        </SStepButton>
        <SStepButton
          aria-pressed={source === "manual"}
          sx={{
            bg: getToken(
              source === "manual" ? "controls.dim.active" : "controls.dim.base",
            ),
          }}
          onClick={() => onSourceChange("manual")}
        >
          <Icon
            component={PencilLine}
            size="l"
            color={getToken("text.tint.secondary")}
          />
          <Stack gap="xs" minWidth={0} flex={1} align="flex-start">
            <Text fs="p4" fw={500}>
              {t("bankWithdraw.account.add")}
            </Text>
            <Text fs="p6" color={getToken("text.medium")}>
              {t("bankWithdraw.account.addDescription")}
            </Text>
          </Stack>
          {source === "manual" && (
            <Icon
              component={Check}
              size="m"
              color={getToken("text.tint.secondary")}
            />
          )}
        </SStepButton>
      </Stack>
      {source === "manual" && (
        <Stack gap="l">
          <Separator />
          <Alert
            description={
              <Text fs="p5" lh={1.4}>
                {t("bankV2.withdraw.bank.demoOnly")}
              </Text>
            }
          />
          <Grid
            columnTemplate={["minmax(0, 1fr)", "repeat(2, minmax(0, 1fr))"]}
            gap="l"
          >
            {fields.map((field) => (
              <Flex key={field} direction="column" gap="s" minWidth={0}>
                <Label htmlFor={`bank-withdraw-v2-${field}`}>
                  {t(`bankV2.withdraw.bank.field.${field}`, { currency })}
                </Label>
                <Input
                  id={`bank-withdraw-v2-${field}`}
                  value={details[field]}
                  readOnly={field === "beneficiary"}
                  aria-describedby={
                    field === "beneficiary"
                      ? "bank-withdraw-v2-beneficiary-profile"
                      : undefined
                  }
                  maxLength={80}
                  autoComplete="off"
                  onChange={(event) =>
                    onDetailsChange({ ...details, [field]: event.target.value })
                  }
                />
                {field === "beneficiary" && (
                  <Text
                    id="bank-withdraw-v2-beneficiary-profile"
                    fs="p6"
                    color={getToken("text.medium")}
                  >
                    {t("bankV2.withdraw.bank.profileOwner")}
                  </Text>
                )}
              </Flex>
            ))}
          </Grid>
          <Text fs="p6" color={getToken("text.medium")}>
            {t("bankV2.withdraw.bank.demoFormat")}
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
