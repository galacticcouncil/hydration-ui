import {
  CircleAlertIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@galacticcouncil/ui/assets/icons"
import { Alert, Button, LoadingButton } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { BankStepShell } from "@/modules/onramp/bank/components/BankStepShell"
import { useBankFlow } from "@/modules/onramp/bank/hooks/useBankFlow"
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

// Bearer links (API doc 2 step 5): opened for the user only, never stored or
// put in a URL of ours. Our code logs them nowhere: the onboarding query is
// marked sensitive, so the app's global react-query error log prints its key
// and error only (utils/queryErrorLog.ts). The query is dropped (gcTime 0) once
// no screen shows it; browser extensions reading the page are out of reach.
const openHostedLink = (link: HostedLink) => {
  if (link.url) window.open(link.url, "_blank", "noopener,noreferrer")
}

/**
 * API doc 2 step 5, as Figma S04-S06. The stage picks the copy only;
 * availability is `rails`. S05 ("Continue on Bridge") is this screen after
 * a Bridge page was opened here; the server's stage still decides the rest.
 */
export const BankVerify: FC<BankVerifyProps> = ({
  step,
  isChecking,
  onCheck,
}) => {
  const { t } = useTranslation(["onramp"])
  const { direction, onClose } = useBankFlow()
  const [opened, setOpened] = useState(false)
  const { view, links } = step
  const needsSupport = view === "rejected" || view === "paused"
  const anyLinkUnreadable = !links.kyc.readable || !links.tos.readable
  const open = (link: HostedLink) => {
    openHostedLink(link)
    setOpened(true)
  }

  const rateLimited = step.rateLimited && (
    <Alert variant="info" description={t("bank.verify.rateLimited")} />
  )

  if (view === "action" && opened)
    return (
      <BankStepShell
        title={t("bank.flow.verifyTitle")}
        step="verify"
        onBack={() => setOpened(false)}
      >
        <BankMessage
          icon={ShieldCheckIcon}
          title={t("bank.verify.opened.title")}
          description={t(`bank.verify.opened.description.${direction}`)}
          actions={
            <>
              <LoadingButton
                size="large"
                isLoading={isChecking}
                disabled={isChecking}
                onClick={onCheck}
              >
                {t("bank.verify.opened.return")}
              </LoadingButton>
              <Button
                size="large"
                variant="tertiary"
                disabled={!links.kyc.readable}
                onClick={() => open(links.kyc)}
              >
                {t("bank.verify.opened.again")}
              </Button>
            </>
          }
        >
          {rateLimited}
        </BankMessage>
      </BankStepShell>
    )

  if (view === "action")
    return (
      <BankStepShell title={t("bank.flow.verifyTitle")} step="verify">
        <BankMessage
          icon={ShieldCheckIcon}
          title={t("bank.verify.action.title")}
          description={t(`bank.verify.action.description.${direction}`)}
          actions={
            <>
              <Button
                size="large"
                disabled={!links.kyc.readable}
                onClick={() => open(links.kyc)}
              >
                {t("bank.verify.kycCta")}
              </Button>
              <Button
                size="large"
                variant="tertiary"
                disabled={!links.tos.readable}
                onClick={() => open(links.tos)}
              >
                {t("bank.verify.tosCta")}
              </Button>
            </>
          }
        >
          {rateLimited}
          {anyLinkUnreadable && (
            <Alert
              variant="warning"
              description={t("bank.verify.linkUnavailable")}
            />
          )}
        </BankMessage>
      </BankStepShell>
    )

  // S06 and the states Figma does not draw: a passive wait, a support case or
  // an unreadable stage. Each can be left; only a read is offered again.
  return (
    <BankStepShell title={t("bank.flow.statusTitle")} step="verify">
      <BankMessage
        icon={STAGE_ICONS[view]}
        title={t(`bank.verify.${view}.title`)}
        description={t(`bank.verify.${view}.description`)}
        note={needsSupport ? undefined : t("bank.verify.leaveNote")}
        actions={
          <>
            {onClose && (
              <Button size="large" variant="secondary" onClick={onClose}>
                {t("bank.flow.backToPortfolio")}
              </Button>
            )}
            {!needsSupport && (
              <LoadingButton
                size="large"
                variant="tertiary"
                isLoading={isChecking}
                disabled={isChecking}
                onClick={onCheck}
              >
                {t("bank.verify.checkStatus")}
              </LoadingButton>
            )}
          </>
        }
      >
        {rateLimited}
      </BankMessage>
    </BankStepShell>
  )
}
