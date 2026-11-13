import { LandmarkIcon, PencilIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Button,
  Chip,
  ModalBody,
  ModalFooter,
  OptionCard,
  Stack,
  Text,
  TextButton,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountRow } from "@/modules/onramp/bank/components/BankAccountRow"
import type { BankAccountView } from "@/modules/onramp/bank/config/schemas"
import { getCashOutAccounts } from "@/modules/onramp/bank/utils/cashOut"

type BankAccountPickerProps = {
  accounts: BankAccountView[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  isRemoving: boolean
  /** Already translated: the list read's failure and the last remove's outcome. */
  notices: Array<{ variant: "warning" | "info" | "success"; text: string }>
  onContinue: () => void
}

/** The account's line under its name: ••last4, currency and rail, bank name. */
export const useBankAccountLine = () => {
  const { t } = useTranslation(["onramp"])
  return (account: BankAccountView) =>
    [
      account.last4
        ? t("bank.accounts.row.last4", { last4: account.last4 })
        : null,
      account.currency && account.currency !== "unknown"
        ? t(`bank.accounts.row.currency.${account.currency}`)
        : null,
      account.bankName,
    ]
      .filter((part): part is string => !!part)
      .join(" · ")
}

/**
 * Figma W02: the saved accounts a cash-out can go to (active, known
 * currency) as selectable rows, then "Add another bank account". Accounts
 * that cannot take a cash-out (inactive, or not readable now) are listed
 * apart with their remove action only. `unknown` is never "inactive".
 */
export const BankAccountPicker: FC<BankAccountPickerProps> = ({
  accounts,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  isRemoving,
  notices,
  onContinue,
}) => {
  const { t } = useTranslation(["onramp"])
  const line = useBankAccountLine()
  const usable = getCashOutAccounts(accounts)
  const others = accounts.filter((a) => !usable.includes(a))
  const selected = usable.find((a) => a.id === selectedId)

  return (
    <>
      <ModalBody>
        <Stack gap="m">
          {notices.map((notice) => (
            <Alert
              key={notice.text}
              variant={notice.variant}
              description={notice.text}
            />
          ))}
          {usable.length > 0 && (
            <Text fs="p5" color={getToken("text.medium")}>
              {t("bank.accounts.saved")}
            </Text>
          )}
          {usable.map((account) => (
            <OptionCard
              key={account.id}
              icon={LandmarkIcon}
              label={account.bankName ?? t("bank.accounts.row.status.active")}
              description={line({ ...account, bankName: null })}
              value={
                <Chip variant="green" size="small">
                  {t("bank.accounts.row.chip.active")}
                </Chip>
              }
              isActive={account.id === selectedId}
              onClick={() => onSelect(account.id)}
            />
          ))}
          <OptionCard
            icon={PencilIcon}
            label={
              accounts.length > 0
                ? t("bank.accounts.addAnother")
                : t("bank.accounts.add")
            }
            description={t("bank.accounts.ownName")}
            value=""
            isActive={false}
            onClick={onAdd}
          />
          {selected && (
            <TextButton
              disabled={isRemoving}
              onClick={() => onRemove(selected.id)}
            >
              {t("bank.accounts.remove")}
            </TextButton>
          )}
          {others.length > 0 && (
            <Stack gap="s">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("bank.accounts.others")}
              </Text>
              {others.map((account) => (
                <BankAccountRow
                  key={account.id}
                  account={account}
                  isRemoving={isRemoving}
                  onRemove={() => onRemove(account.id)}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          size="large"
          width="100%"
          disabled={!selected}
          onClick={onContinue}
        >
          {t("bank.flow.continue")}
        </Button>
      </ModalFooter>
    </>
  )
}
