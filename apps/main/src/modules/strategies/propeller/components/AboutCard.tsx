import DepositIllustration from "@galacticcouncil/ui/assets/images/juicer/Deposit.webp"
import EarnIllustration from "@galacticcouncil/ui/assets/images/juicer/Earn.webp"
import WithdrawIllustration from "@galacticcouncil/ui/assets/images/juicer/Withdraw.webp"
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapsible,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import {
  SJuicerExplainerFlow,
  SJuicerExplainerIllustration,
  SJuicerExplainerPanel,
  SJuicerExplainerStep,
} from "@/modules/strategies/propeller/components/AboutCard.styled"

const STAGES = ["deposit", "earn", "withdraw"] as const
const ILLUSTRATIONS = {
  deposit: DepositIllustration,
  earn: EarnIllustration,
  withdraw: WithdrawIllustration,
} as const
const NOTES = {
  deposit: "explainer.deposit.note",
  earn: "explainer.earn.note",
  withdraw: "explainer.withdraw.note",
} as const

export const AboutCard = () => {
  const { t } = useTranslation(["strategies", "propeller"])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("strategies:about.title", {
            suffix: t("propeller:strategy.name"),
          })}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="l">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("propeller:explainer.intro")}
          </Text>
          <SJuicerExplainerFlow
            as="ol"
            role="list"
            aria-label={t("propeller:explainer.steps")}
          >
            {STAGES.map((stage) => (
              <SJuicerExplainerStep key={stage} as="li">
                <SJuicerExplainerIllustration
                  src={ILLUSTRATIONS[stage]}
                  alt=""
                  aria-hidden="true"
                  width={560}
                  height={400}
                  loading="lazy"
                  decoding="async"
                />
                <SJuicerExplainerPanel>
                  <Text as="h3" fs="p2" font="primary" fw={500}>
                    {t(`propeller:explainer.${stage}.label`)}
                  </Text>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t(`propeller:explainer.${stage}.description`)}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")}>
                    {t(`propeller:${NOTES[stage]}`)}
                  </Text>
                </SJuicerExplainerPanel>
              </SJuicerExplainerStep>
            ))}
          </SJuicerExplainerFlow>
          <Separator />
          <Text fs="p6" color={getToken("text.low")}>
            {t("propeller:explainer.risk")}
          </Text>
          <Collapsible
            label={t("propeller:explainer.details")}
            actionLabel={t("propeller:explainer.show")}
            actionLabelWhenOpen={t("propeller:explainer.hide")}
          >
            <Markdown id="propeller-vault" muted size="small" />
          </Collapsible>
        </Stack>
      </CardBody>
    </Card>
  )
}
