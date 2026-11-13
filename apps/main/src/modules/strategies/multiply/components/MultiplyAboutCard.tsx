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
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import {
  SAboutFlow,
  SAboutNumber,
  SAboutPanel,
  SAboutStep,
} from "@/modules/strategies/multiply/components/MultiplyAboutCard.styled"

const STAGES = ["open", "earn", "exit"] as const

export const MultiplyAboutCard: FC = () => {
  const { t } = useTranslation("strategies")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("about.title", { suffix: t("multiply.name") })}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="l">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("multiply.about.intro")}
          </Text>
          <SAboutFlow
            as="ol"
            role="list"
            aria-label={t("multiply.about.steps")}
          >
            {STAGES.map((stage, index) => (
              <SAboutStep key={stage} as="li">
                <SAboutNumber aria-hidden="true">{index + 1}</SAboutNumber>
                <SAboutPanel>
                  <Text as="h3" fs="p2" font="primary" fw={500}>
                    {t(`multiply.about.${stage}.label`)}
                  </Text>
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t(`multiply.about.${stage}.description`)}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")}>
                    {t(`multiply.about.${stage}.note`)}
                  </Text>
                </SAboutPanel>
              </SAboutStep>
            ))}
          </SAboutFlow>
          <Separator />
          <Text fs="p6" color={getToken("text.low")}>
            {t("multiply.about.risk")}
          </Text>
          <Collapsible
            label={t("multiply.about.details")}
            actionLabel={t("multiply.about.show")}
            actionLabelWhenOpen={t("multiply.about.hide")}
          >
            <Markdown id="multiply" muted size="small" />
          </Collapsible>
        </Stack>
      </CardBody>
    </Card>
  )
}
