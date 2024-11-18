import { useBestNumber } from "api/chain"
import { useReferendumInfo } from "api/democracy"
import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { Countdown } from "components/Countdown/Countdown"
import { Text } from "components/Typography/Text/Text"
import React, { useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { PARACHAIN_BLOCK_TIME } from "utils/constants"
import { SContent } from "./MoneyMarketCountdown.styled"

const MONEY_MARKET_REFERENDUM_INDEX = "189"
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
  const [expired, setExpired] = useState(false)

  const referendumInfo = useReferendumInfo(MONEY_MARKET_REFERENDUM_INDEX)

  const timestampDiff = useMemo(() => {
    if (bestNumber?.data && referendumInfo?.data) {
      return BN(referendumInfo?.data?.onchainData.meta.end ?? 0)
        .minus(bestNumber.data?.parachainBlockNumber.toBigNumber() ?? 0)
        .times(PARACHAIN_BLOCK_TIME)
        .times(1000)
        .toNumber()
    }

    return 0
  }, [bestNumber, referendumInfo])

  const isExpired = timestampDiff <= 0 || expired

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
          {now.current && !isExpired ? (
            <div
              sx={{ flex: ["column", "row"], align: "center", gap: 16, mb: 40 }}
            >
              <PeepoAnimation sx={{ mb: [20, 0] }} />
              <Countdown
                ts={now.current + timestampDiff}
                onExpire={() => setExpired(true)}
              />
              <PeepoAnimation sx={{ display: ["none", "block"] }} />
            </div>
          ) : (
            <PeepoAnimation sx={{ mb: 20 }} />
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
            {isExpired
              ? t("lending.countdown.expired.title")
              : t("lending.countdown.ongoing.title")}
          </Text>
          {MONEY_MARKET_REFERENDUM_INDEX && (
            <a
              target="_blank"
              rel="noreferrer"
              href={MONEY_MARKET_REFERENDUM_LINK}
              sx={{ mt: 20 }}
            >
              <Button variant="secondary" size="small" as="div">
                {t("lending.countdown.button")}
              </Button>
            </a>
          )}
        </div>
      </SContent>
    </div>
  )
}
