import { Points, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const HowToDepositQnA: FC = () => {
  const { t } = useTranslation("wallet")

  const steps = t("deposit.howTo.qna.steps", { returnObjects: true }) as {
    label: string
    description: string
  }[]

  return (
    <div>
      <Text
        font="primary"
        fw={500}
        fs="p2"
        lh={1}
        color={getToken("text.tint.primary")}
        pt={20}
        pb={12}
      >
        {t("deposit.howTo.qna.title")}
      </Text>
      {steps.map((step, index) => (
        <Points
          key={index}
          number={index + 1}
          title={step.label}
          description={step.description}
        />
      ))}
    </div>
  )
}
