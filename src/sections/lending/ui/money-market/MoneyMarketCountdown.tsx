import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { SContent } from "./MoneyMarketCountdown.styled"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"

export const MoneyMarketCountdown = () => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <MoneyMarketBanner />
      <SContent>
        <div
          sx={{
            py: [50, 80],
            flex: "column",
            justify: "center",
            align: "center",
            mx: "auto",
            width: ["100%", "30%"],
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            width={40}
            height={40}
            sx={{ mb: 20 }}
          >
            <source src="/images/peepoMoneyRain.webm" type="video/webm" />
          </video>
          <Text
            as="h2"
            fs={24}
            font="GeistMono"
            color="brightBlue300"
            tAlign="center"
            sx={{ mb: 20 }}
            css={{ textWrap: "balance" }}
          >
            {t("lending.countdown.title")}
          </Text>
          <Text fs={12} color="darkBlue100" tAlign="center" sx={{ mb: 40 }}>
            {t("lending.countdown.description")}
          </Text>
          <Button variant="secondary" size="small">
            {t("lending.countdown.button")}
          </Button>
        </div>
      </SContent>
    </div>
  )
}
