import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SRowNumber } from "sections/deposit/components/CexDepositGuide.styled"
import { CEX_CONFIG } from "sections/deposit/DepositPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { safeConvertAddressSS58 } from "utils/formatting"

const useCexDepositGuide = (cexId: string, ss58Format: number) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  return useMemo(() => {
    const formattedAddress =
      safeConvertAddressSS58(account?.address, ss58Format, false) ?? ""

    if (cexId === "binance") {
      return [
        { title: t("deposit.guide.binance.step1.title") },
        { title: t("deposit.guide.binance.step2.title") },
        ...(formattedAddress
          ? [
              {
                title: t("deposit.guide.binance.step3.title", {
                  address: formattedAddress,
                }),
              },
            ]
          : []),
        { title: t("deposit.guide.binance.step4.title") },
        { title: t("deposit.guide.binance.step5.title") },
        { title: t("deposit.guide.binance.step6.title") },
        { title: t("deposit.guide.binance.step7.title") },
      ]
    }

    if (cexId === "kucoin") {
      return [
        { title: t("deposit.guide.kucoin.step1.title") },
        { title: t("deposit.guide.kucoin.step2.title") },
        ...(formattedAddress
          ? [
              {
                title: t("deposit.guide.kucoin.step3.title", {
                  address: formattedAddress,
                }),
              },
            ]
          : []),
        { title: t("deposit.guide.kucoin.step4.title") },
        { title: t("deposit.guide.kucoin.step5.title") },
        { title: t("deposit.guide.kucoin.step6.title") },
        { title: t("deposit.guide.kucoin.step7.title") },
      ]
    }

    if (cexId === "gateio") {
      return [
        { title: t("deposit.guide.gateio.step1.title") },
        { title: t("deposit.guide.gateio.step2.title") },
        ...(formattedAddress
          ? [
              {
                title: t("deposit.guide.gateio.step3.title", {
                  address: formattedAddress,
                }),
              },
            ]
          : []),
        { title: t("deposit.guide.gateio.step4.title") },
      ]
    }

    return []
  }, [account?.address, ss58Format, cexId, t])
}

export type CexDepositGuideProps = { ss58Format: number; cexId: string }

export const CexDepositGuide: React.FC<CexDepositGuideProps> = ({
  cexId,
  ss58Format,
}) => {
  const { t } = useTranslation()

  const guide = useCexDepositGuide(cexId, ss58Format)
  if (!guide.length) {
    return null
  }

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)!

  return (
    <div>
      <GradientText gradient="pinkLightBlue" fs={18} sx={{ mb: 12 }}>
        {t("deposit.guide.title", { cex: cex.title })}
      </GradientText>
      <div sx={{ flex: "column", gap: 20 }}>
        {guide.map(({ title }, index) => (
          <CexDepositGuideRow key={index} step={index + 1} title={title} />
        ))}
      </div>
    </div>
  )
}

const CexDepositGuideRow: React.FC<{
  step: number
  title: string
  description?: string
}> = ({ step, title, description }) => {
  return (
    <div sx={{ flex: "row", gap: 20, align: "center" }}>
      <SRowNumber>{step}</SRowNumber>
      <div>
        <Text
          fs={14}
          lh={20}
          color="basic200"
          css={{ wordBreak: "break-word" }}
        >
          {title}
        </Text>
        {description && (
          <Text
            fs={12}
            color="darkBlue200"
            sx={{ mt: 2 }}
            css={{ wordBreak: "break-word" }}
          >
            {description}
          </Text>
        )}
      </div>
    </div>
  )
}
