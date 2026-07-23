import {
  Alert,
  Button,
  Flex,
  ModalContentDivider,
  Stack,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { isString } from "remeda"

import { useTransactionAlerts } from "@/modules/transactions/hooks/useTransactionAlerts"
import { ReviewTransactionSubmitButton } from "@/modules/transactions/review/ReviewTransactionSubmitButton"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

type ReviewTransactionFooterProps = {
  closable?: boolean
}

export const ReviewTransactionFooter: React.FC<
  ReviewTransactionFooterProps
> = ({ closable = true }) => {
  const { t } = useTranslation("common")

  const {
    onClose,
    isIdle,
    isSigning,
    isSubmitted,
    alerts: txAlerts,
    dryRunError,
  } = useTransaction()

  const { alerts: genericAlerts } = useTransactionAlerts()

  const [consented, setConsented] = useState<boolean[]>([])

  const isCloseDisabled = isSigning || isSubmitted || !closable

  const isConsentPending = !!txAlerts?.some(
    (alert, i) => alert.requiresUserConsent && !consented[i],
  )

  const hasGenericAlerts = genericAlerts.length > 0
  const hasTxAlerts = !!txAlerts && txAlerts.length > 0
  const hasAlerts = hasGenericAlerts || hasTxAlerts || !!dryRunError

  if (isIdle) {
    return (
      <Stack width="100%" gap="base">
        {hasGenericAlerts
          ? genericAlerts.map(({ key, ...alert }) => (
              <Alert key={key} {...alert} />
            ))
          : txAlerts?.map((alert, i) => (
              <Alert
                key={i}
                variant={alert.variant}
                title={alert.title}
                description={alert.description}
                action={
                  alert.requiresUserConsent ? (
                    <Flex align="center" as="label" gap="base">
                      <Toggle
                        size="large"
                        checked={!!consented[i]}
                        onCheckedChange={(checked) => {
                          setConsented((prev) => {
                            const next = [...prev]
                            next[i] = checked
                            return next
                          })
                        }}
                      />
                      <Text fs="p4" lh={1.3} fw={500}>
                        {isString(alert.requiresUserConsent)
                          ? alert.requiresUserConsent
                          : t("transaction.alert.acceptRisk")}
                      </Text>
                    </Flex>
                  ) : undefined
                }
              />
            ))}

        {dryRunError && (
          <Alert
            variant="warning"
            description={
              <Text fs="p4" fw={500} lh={1}>
                {t("transaction.alert.dryRunWarning", {
                  reason: dryRunError.name,
                })}
              </Text>
            }
          />
        )}

        {hasAlerts && <ModalContentDivider my="m" />}

        <Flex
          direction={["column-reverse", "row"]}
          justify="space-between"
          gap="base"
        >
          <Button
            size="large"
            variant="tertiary"
            onClick={onClose}
            disabled={isCloseDisabled}
          >
            {t("close")}
          </Button>

          <ReviewTransactionSubmitButton disabled={isConsentPending} />
        </Flex>
      </Stack>
    )
  }

  return (
    <Button
      size="large"
      width="100%"
      onClick={onClose}
      variant={isCloseDisabled ? "tertiary" : "primary"}
      disabled={isCloseDisabled}
    >
      {t("close")}
    </Button>
  )
}
