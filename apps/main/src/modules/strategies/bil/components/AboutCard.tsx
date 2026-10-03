import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PaperProps,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"

export const AboutCard: React.FC<PaperProps> = (props) => {
  const { t } = useTranslation("strategies")
  const { bil } = useBilStrategy()
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>
          {t("about.title", {
            suffix: bil.symbol,
          })}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Markdown id="bil-vault" muted size="small" />
      </CardBody>
    </Card>
  )
}
