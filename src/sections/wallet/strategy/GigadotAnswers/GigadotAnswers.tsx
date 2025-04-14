import { FaqList } from "components/FaqList/FaqList"
import { Trans, useTranslation } from "react-i18next"

export const GigadotAnswers = () => {
  const { t } = useTranslation()

  return (
    <FaqList
      items={[
        {
          question: t("wallet.strategy.gigadot.whatIs"),
          answer: (
            <Trans t={t} i18nKey="wallet.strategy.gigadot.whatIs.answer" />
          ),
        },
      ]}
    />
  )
}
