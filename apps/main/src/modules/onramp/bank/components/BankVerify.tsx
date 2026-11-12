import {
  CircleAlertIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@galacticcouncil/ui/assets/icons"
import { Alert, Button, LoadingButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import {
  OnboardingStep,
  StageView,
} from "@/modules/onramp/bank/utils/onboarding"

type VerifyStep = Extract<OnboardingStep, { kind: "verify" }>
type HostedLink = VerifyStep["links"]["kyc"]

type BankVerifyProps = {
  step: VerifyStep
  isChecking: boolean
  onCheck: () => void
}

const STAGE_ICONS: Record<StageView, FC> = {
  action: ShieldCheckIcon,
  review: ClockIcon,
  notAvailableYet: ClockIcon,
  rejected: CircleAlertIcon,
  paused: CircleAlertIcon,
  unknown: CircleAlertIcon,
}

// Bearer links (API doc 2 step 5): opened for the user only, never logged,
// stored or put in a URL of ours.
const openHostedLink = (link: HostedLink) => {
  if (link.url) window.open(link.url, "_blank", "noopener,noreferrer")
}

/** API doc 2 step 5. The stage picks the copy only; availability is `rails`. */
export const BankVerify: FC<BankVerifyProps> = ({
  step,
  isChecking,
  onCheck,
}) => {
  const { t } = useTranslation(["onramp"])
  const { view, links } = step
  const needsSupport = view === "rejected" || view === "paused"
  const anyLinkUnreadable = !links.kyc.readable || !links.tos.readable

  return (
    <BankMessage
      icon={STAGE_ICONS[view]}
      title={t(`bank.verify.${view}.title`)}
      description={t(`bank.verify.${view}.description`)}
    >
      {step.rateLimited && (
        <Alert variant="info" description={t("bank.verify.rateLimited")} />
      )}
      {view === "action" && (
        <>
          {anyLinkUnreadable && (
            <Alert
              variant="warning"
              description={t("bank.verify.linkUnavailable")}
            />
          )}
          <Button
            size="large"
            disabled={!links.kyc.readable}
            onClick={() => openHostedLink(links.kyc)}
          >
            {t("bank.verify.kycCta")}
          </Button>
          <Button
            size="large"
            variant="secondary"
            disabled={!links.tos.readable}
            onClick={() => openHostedLink(links.tos)}
          >
            {t("bank.verify.tosCta")}
          </Button>
        </>
      )}
      {!needsSupport && (
        <LoadingButton
          size="large"
          variant={view === "action" ? "tertiary" : "primary"}
          isLoading={isChecking}
          disabled={isChecking}
          onClick={onCheck}
        >
          {t("bank.verify.checkStatus")}
        </LoadingButton>
      )}
    </BankMessage>
  )
}
