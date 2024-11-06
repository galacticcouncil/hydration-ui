import { useBestNumber } from "api/chain"
import { useReferendumInfo } from "api/democracy"
import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { Countdown } from "components/Countdown/Countdown"
import { Text } from "components/Typography/Text/Text"
import React, { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { PARACHAIN_BLOCK_TIME } from "utils/constants"
import { SContent } from "./MoneyMarketCountdown.styled"

const MONEY_MARKET_REFERENDUM_INDEX = "187"
const MONEY_MARKET_REFERENDUM_LINK = `${import.meta.env.VITE_REFERENDUM_LINK}/${MONEY_MARKET_REFERENDUM_INDEX}`

const PeepoAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <video
    autoPlay
    loop
    muted
    playsInline
    sx={{ width: [60, 40], height: [60, 40] }}
    className={className}
  >
    <source src="/images/peepoMoneyRain.webm" type="video/webm" />
  </video>
)

export const MoneyMarketCountdown = () => {
  const { t } = useTranslation()
  const now = useRef(Date.now())
  const bestNumber = useBestNumber()

  const referendumInfo = useReferendumInfo(MONEY_MARKET_REFERENDUM_INDEX)

  const diff = useMemo(() => {
    if (bestNumber?.data && referendumInfo?.data) {
      return BN(referendumInfo?.data?.onchainData.meta.end ?? 0)
        .minus(bestNumber.data?.parachainBlockNumber.toBigNumber() ?? 0)
        .times(PARACHAIN_BLOCK_TIME)
        .toNumber()
    }

    return 0
  }, [bestNumber, referendumInfo])

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <MoneyMarketBanner />
      <SContent>
        <div
          sx={{
            py: [20, 80],
            flex: "column",
            justify: "center",
            align: "center",
            mx: "auto",
            width: ["100%", "30%"],
          }}
        >
          {now.current && diff > 0 && (
            <div
              sx={{ flex: ["column", "row"], align: "center", gap: 16, mb: 40 }}
            >
              <PeepoAnimation sx={{ mb: [20, 0] }} />
              <Countdown
                ts={now.current + diff * 1000}
                expiredMessage={t("lending.countdown.expired")}
              />
              <PeepoAnimation sx={{ display: ["none", "block"] }} />
            </div>
          )}

          <Text
            as="h2"
            fs={[20, 24]}
            font="GeistMono"
            color="brightBlue300"
            tAlign="center"
            sx={{ mb: 20 }}
            css={{ textWrap: "balance" }}
          >
            {t("lending.countdown.title")}
          </Text>
          <Text
            fs={14}
            lh={18}
            color="darkBlue100"
            tAlign="center"
            sx={{ mb: 40 }}
          >
            {t("lending.countdown.description")}
          </Text>
          <a
            target="_blank"
            rel="noreferrer"
            href={MONEY_MARKET_REFERENDUM_LINK}
          >
            <Button variant="secondary" size="small" as="div">
              {t("lending.countdown.button")}
            </Button>
          </a>
        </div>
      </SContent>
    </div>
  )
}
