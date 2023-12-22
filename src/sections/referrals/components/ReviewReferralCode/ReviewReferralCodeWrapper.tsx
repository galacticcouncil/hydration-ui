import { Text } from "components/Typography/Text/Text"
import { ReferralCode } from "./ReferralCode"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import { useToast } from "state/toasts"

export const ReviewReferralCodeWrapper = ({
  referralCode,
}: {
  referralCode: string
}) => {
  const { t } = useTranslation()

  const { temporary } = useToast()

  useEffect(() => {
    temporary({
      title: (
        <div>
          <p className="referralTitle">
            {t("referrals.toasts.storedCode.valid.title")}
          </p>
          <p className="referralDesc">
            {t("referrals.toasts.storedCode.valid.desc")}
          </p>
        </div>
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      sx={{
        flex: "row",
        justify: "space-between",
        align: "flex-start",
        py: 10,
      }}
    >
      <div sx={{ flex: "column", gap: 8 }}>
        <Text color="basic400" fs={14} tAlign="left">
          {t("referrals.referrer.code")}
        </Text>
        <Text color="brightBlue300" fs={12} tAlign="left" sx={{ width: 300 }}>
          {t("referrals.reviewTransaction.desc")}
        </Text>
      </div>
      <ReferralCode code={referralCode} />
    </div>
  )
}
