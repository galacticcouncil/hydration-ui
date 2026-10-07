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
  SJuicerExplainerNumber,
  SJuicerExplainerPanel,
  SJuicerExplainerStep,
} from "@/modules/strategies/propeller/components/AboutCard.styled"

const STAGES = ["deposit", "earn", "withdraw"] as const
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
            {STAGES.map((stage, index) => (
              <SJuicerExplainerStep key={stage} as="li">
                <SJuicerExplainerNumber
                  aria-hidden="true"
                  align="center"
                  justify="center"
                >
                  <Text font="primary" fs="p3" fw={700} lh={1}>
                    {index + 1}
                  </Text>
                </SJuicerExplainerNumber>
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
