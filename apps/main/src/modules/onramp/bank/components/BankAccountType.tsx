import { CheckIcon } from "@galacticcouncil/ui/assets/icons"
import BankBusiness from "@galacticcouncil/ui/assets/images/BankBusiness.png"
import BankIndividual from "@galacticcouncil/ui/assets/images/BankIndividual.png"
import {
  Alert,
  Icon,
  Image,
  LoadingButton,
  ModalBody,
  ModalFooter,
  OptionCard,
  Stack,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { CustomerType } from "@/modules/onramp/bank/config/schemas"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
import { useHbrCreateCustomer } from "@/modules/onramp/bank/hooks/useHbr"
import { classifyCreateCustomerError } from "@/modules/onramp/bank/utils/onboarding"

type BankAccountTypeProps = {
  h160: string
}

const otherType = (type: CustomerType): CustomerType =>
  type === "individual" ? "business" : "individual"

/** API doc 2 step 3: create the customer with a type only; no personal data passes here. */
export const BankAccountType: FC<BankAccountTypeProps> = ({ h160 }) => {
  const { t } = useTranslation(["onramp"])
  const [type, setType] = useState<CustomerType>("individual")
  // Bridge holds an earlier attempt's type (the other one): only that is offered.
  const [recordedType, setRecordedType] = useState<CustomerType | null>(null)
  const create = useHbrCreateCustomer(h160)
  const { direction } = useBankFlow()

  const errorKind = create.isError
    ? classifyCreateCustomerError(create.error)
    : null
  const selected = recordedType ?? type
  // The create cannot succeed until support re-keys the wallet: no retry.
  const blocked = errorKind === "needsSupport"

  const submit = () =>
    create.mutate(selected, {
      onError: (error, variables) => {
        if (classifyCreateCustomerError(error) === "typeConflict")
          setRecordedType(otherType(variables))
      },
    })

  return (
    <BankStepShell
      title={t(`bank.accountType.title.${direction}`)}
      description={t(`bank.accountType.description.${direction}`)}
      step="verify"
    >
      <ModalBody>
        <Stack gap="l">
          <Stack
            gap="m"
            sx={{
              "& > button": { minHeight: 80, height: "auto", padding: "l" },
            }}
          >
            {(["individual", "business"] as const).map((option) => (
              <OptionCard
                key={option}
                icon={
                  <Image
                    src={
                      option === "individual" ? BankIndividual : BankBusiness
                    }
                    alt=""
                    lazy={false}
                    sx={{ width: 48, height: 48, flexShrink: 0 }}
                  />
                }
                label={t(`bank.accountType.${option}.title`)}
                description={t(`bank.accountType.${option}.description`)}
                value={
                  selected === option ? (
                    <Icon component={CheckIcon} size="m" aria-hidden />
                  ) : null
                }
                isActive={selected === option}
                disabled={
                  create.isPending ||
                  blocked ||
                  (recordedType !== null && option !== recordedType)
                }
                onClick={() => setType(option)}
              />
            ))}
          </Stack>
          {errorKind && (
            <Alert
              variant="warning"
              description={
                errorKind === "typeConflict"
                  ? t("bank.accountType.error.typeConflict", {
                      type: t(`bank.accountType.${selected}.title`),
                    })
                  : errorKind === "needsSupport" ||
                      errorKind === "uncertain" ||
                      errorKind === "notSentMayExist" ||
                      errorKind === "notSent"
                    ? t(`bank.accountType.error.${errorKind}`)
                    : t(`bank.error.${errorKind}`)
              }
            />
          )}
        </Stack>
      </ModalBody>
      {!blocked && (
        <ModalFooter>
          <LoadingButton
            size="large"
            width="100%"
            isLoading={create.isPending}
            disabled={create.isPending}
            onClick={submit}
          >
            {t("bank.accountType.cta")}
          </LoadingButton>
        </ModalFooter>
      )}
    </BankStepShell>
  )
}
