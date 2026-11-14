import { LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountMenu } from "@/modules/onramp/bank/components/BankAccountMenu"
import type { ListBankAccountsResponse } from "@/modules/onramp/bank/config/schemas"

type BankAccountRowProps = {
  account: ListBankAccountsResponse["bankAccounts"][number]
  isRemoving: boolean
  onRemove: () => void
}

/** One listed account. `unknown` is a failed read, never "inactive" (API doc 4). */
export const BankAccountRow: FC<BankAccountRowProps> = ({
  account,
  isRemoving,
  onRemove,
}) => {
  const { t } = useTranslation(["onramp"])
  const parts = [
    account.last4
      ? t("bank.accounts.row.last4", { last4: account.last4 })
      : null,
    account.currency && account.currency !== "unknown"
      ? t(`bank.accounts.row.currency.${account.currency}`)
      : null,
    account.bankName,
  ].filter((part): part is string => !!part)

  return (
    <Flex align="center" gap="m" py="s">
      <Icon component={LandmarkIcon} size="m" color={getToken("text.medium")} />
      <Stack flex={1}>
        <Text fs="p4" fw={500}>
          {t(`bank.accounts.row.status.${account.status}`)}
        </Text>
        {parts.length > 0 && (
          <Text fs="p5" color={getToken("text.low")}>
            {parts.join(" · ")}
          </Text>
        )}
      </Stack>
      <BankAccountMenu isRemoving={isRemoving} onRemove={onRemove} />
    </Flex>
  )
}
