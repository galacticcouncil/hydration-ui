import { Separator } from "components/Separator/Separator"
import { useTranslation } from "react-i18next"
import { GigadotAnswerSection } from "sections/wallet/strategy/GigadotAnswers/GigadotAnswerSection"
import { SGigadotAnswers } from "./GigadotAnswers.styled"

export const GigadotAnswers = () => {
  const { t } = useTranslation()

  return (
    <SGigadotAnswers>
      <GigadotAnswerSection
        question={t("wallet.strategy.gigadot.whatIs")}
        answer={t("wallet.strategy.gigadot.whatIs.answer")}
      />
      <Separator />
      <GigadotAnswerSection
        question={t("wallet.strategy.gigadot.howItWorks")}
        answer={t("wallet.strategy.gigadot.howItWorks.answer")}
      />
      <Separator />
      <GigadotAnswerSection
        question={t("wallet.strategy.gigadot.isItSafe")}
        answer={t("wallet.strategy.gigadot.isItSafe.answer")}
      />
      <Separator />
      <GigadotAnswerSection
        question={t("wallet.strategy.gigadot.whenWithdraw")}
        answer={t("wallet.strategy.gigadot.whenWithdraw.answer")}
      />
    </SGigadotAnswers>
  )
}
