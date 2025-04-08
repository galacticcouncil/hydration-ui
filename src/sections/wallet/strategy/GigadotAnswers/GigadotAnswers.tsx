import { FaqList } from "components/FaqList/FaqList"
import { useTranslation } from "react-i18next"

export const GigadotAnswers = () => {
  const { t } = useTranslation()

  return (
    <>
      <FaqList
        items={[
          {
            question: t("wallet.strategy.gigadot.whatIs"),
            answer: t("wallet.strategy.gigadot.whatIs.answer"),
          },
          {
            question: t("wallet.strategy.gigadot.howItWorks"),
            answer: t("wallet.strategy.gigadot.howItWorks.answer"),
          },
          {
            question: t("wallet.strategy.gigadot.isItSafe"),
            answer: t("wallet.strategy.gigadot.isItSafe.answer"),
          },
          {
            question: t("wallet.strategy.gigadot.whenWithdraw"),
            answer: t("wallet.strategy.gigadot.whenWithdraw.answer"),
          },
        ]}
      />
    </>
  )
}
