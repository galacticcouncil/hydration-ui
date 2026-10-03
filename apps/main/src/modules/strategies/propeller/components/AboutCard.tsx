import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"

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
        <Markdown id="propeller-vault" muted size="small" />
      </CardBody>
    </Card>
  )
}
