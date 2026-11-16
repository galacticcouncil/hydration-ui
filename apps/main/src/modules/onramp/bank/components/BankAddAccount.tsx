import { DollarSignIcon, EuroIcon } from "@galacticcouncil/ui/assets/icons"
import { ModalBody, OptionCard, Stack } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankAccountForm } from "@/modules/onramp/bank/components/BankAccountForm"
import { BankRail } from "@/modules/onramp/bank/components/BankAccountForm.form"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"

type BankAddAccountProps = {
  h160: string
  /** Rails whose off-ramp is open (`rails` only); only these can be picked. */
  rails: { usd: boolean; eur: boolean }
  onDone: () => void
  onBack: () => void
}

/**
 * Figma W03 / W04: add a bank account in two steps, the rail (currency)
 * first, then that rail's fields. Back from the fields returns to the rail
 * choice and drops what was typed (nothing of it is kept anywhere).
 */
export const BankAddAccount: FC<BankAddAccountProps> = ({
  h160,
  rails,
  onDone,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const [rail, setRail] = useState<BankRail | null>(null)

  if (rail)
    return (
      <BankStepShell
        title={t(`bank.accounts.addTitle.${rail}`)}
        description={t("bank.accounts.ownName")}
        step="bankAccount"
        onBack={() => setRail(null)}
      >
        <BankAccountForm h160={h160} rail={rail} onDone={onDone} />
      </BankStepShell>
    )

  return (
    <BankStepShell
      title={t("bank.accounts.railTitle")}
      description={t("bank.accounts.ownName")}
      step="bankAccount"
      onBack={onBack}
    >
      <ModalBody>
        <Stack gap="m">
          <OptionCard
            icon={DollarSignIcon}
            label={t("bank.accounts.form.rail.ach")}
            description={t("bank.accounts.rail.ach")}
            value=""
            isActive={false}
            disabled={!rails.usd}
            onClick={() => setRail("ach")}
          />
          <OptionCard
            icon={EuroIcon}
            label={t("bank.accounts.form.rail.sepa")}
            description={t("bank.accounts.rail.sepa")}
            value=""
            isActive={false}
            disabled={!rails.eur}
            onClick={() => setRail("sepa")}
          />
        </Stack>
      </ModalBody>
    </BankStepShell>
  )
}
