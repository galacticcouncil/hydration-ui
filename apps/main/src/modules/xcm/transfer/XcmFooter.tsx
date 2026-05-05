import {
  Alert,
  Box,
  Flex,
  Separator,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isString } from "remeda"

import { SubmitButton } from "@/modules/xcm/transfer/components/SubmitButton"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import {
  useXcmProvider,
  XcmAlertSeverity,
} from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"

type XcmFooterProps = {
  isSubmitting: boolean
}

const SEVERITY_COLOR_MAP: Record<XcmAlertSeverity, ThemeToken> = {
  error: "accents.danger.secondary",
  warning: "accents.alertAlt.primary",
  info: "text.tint.secondary",
}

export const XcmFooter: React.FC<XcmFooterProps> = ({ isSubmitting }) => {
  const { t } = useTranslation()

  const {
    alerts,
    status,
    dryRunError,
    isLoading,
    isLoadingCall,
    isLoadingTransfer,
  } = useXcmProvider()

  const { formState, watch } = useFormContext<XcmFormValues>()
  const srcChain = watch("srcChain")

  const [consented, setConsented] = useState<Record<string, boolean>>({})

  const isConsentPending = alerts.some(
    (alert) => alert.requiresUserConsent && !consented[alert.key],
  )

  const isTransferValid =
    status === XcmTransferStatus.TransferValid ||
    status === XcmTransferStatus.ApproveAndTransferValid

  const isSubmitReady =
    formState.isValid && isTransferValid && !isConsentPending

  const isLoadingCallOrTransfer = isLoadingCall || isLoadingTransfer

  return (
    <>
      <Separator />
      <Box p={["l", "xl"]}>
        <Flex direction="column" gap="m">
          {alerts.map((alert) => (
            <Alert
              key={alert.key}
              variant={alert.severity}
              description={alert.message}
              action={
                alert.requiresUserConsent ? (
                  <Flex align="center" as="label" gap="base">
                    <Toggle
                      size="large"
                      checked={!!consented[alert.key]}
                      onCheckedChange={(checked) => {
                        setConsented((prev) => ({
                          ...prev,
                          [alert.key]: checked,
                        }))
                      }}
                    />
                    <Text
                      fs="p4"
                      lh={1.3}
                      fw={600}
                      color={getToken(SEVERITY_COLOR_MAP[alert.severity])}
                    >
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
              variant="error"
              title={dryRunError.name}
              tooltip={dryRunError.description}
            />
          )}
          <SubmitButton
            status={status}
            disabled={
              isLoading ||
              isLoadingCallOrTransfer ||
              isSubmitting ||
              !isSubmitReady
            }
            isLoading={isLoading || isLoadingCallOrTransfer || isSubmitting}
            variant={isSubmitReady ? "primary" : "muted"}
            loadingVariant="muted"
            chain={srcChain}
          />
        </Flex>
      </Box>
    </>
  )
}
