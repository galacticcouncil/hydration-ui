import { Text } from "components/Typography/Text/Text"
import { ReferralCode } from "./ReferralCode"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import { useToast } from "state/toasts"
import { PreviewReferrer } from "sections/referrals/components/PreviewReferrer/PreviewReferrer"
import { useReferrerAddress } from "api/referrals"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { theme } from "theme"

export const ReviewReferralCodeWrapper = ({
  referralCode,
}: {
  referralCode: string
}) => {
  const { t } = useTranslation()

  const referrerAddress = useReferrerAddress(referralCode)

  const { temporary } = useToast()

  useEffect(() => {
    temporary({
      hideTime: 6000,
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
    <>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "flex-start",
          py: 10,
        }}
      >
        <div sx={{ flex: "column", gap: 8 }}>
          <div sx={{ flex: "row", gap: 8 }}>
            <Text color="basic400" fs={14} tAlign="left">
              {t("referrals.referrer.code")}
            </Text>
            <div sx={{ display: ["inherit", "none"] }}>
              <InfoTooltip text={t("referrals.reviewTransaction.desc")}>
                <SInfoIcon />
              </InfoTooltip>
            </div>
          </div>
          <Text
            color="brightBlue300"
            fs={12}
            tAlign="left"
            sx={{ width: 300, display: ["none", "inherit"] }}
          >
            {t("referrals.reviewTransaction.desc")}
          </Text>
        </div>
        <ReferralCode code={referralCode} />
      </div>

      {referrerAddress.data && (
        <PreviewReferrer
          referrerAddress={referrerAddress.data}
          css={{ background: theme.colors.darkBlue700 }}
        />
      )}
    </>
  )
}
