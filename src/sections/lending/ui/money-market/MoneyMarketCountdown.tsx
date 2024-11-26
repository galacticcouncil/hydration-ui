import { useBestNumber } from "api/chain"
import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { Countdown } from "components/Countdown/Countdown"
import { Text } from "components/Typography/Text/Text"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { SContent } from "./MoneyMarketCountdown.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useIsTestnet } from "api/provider"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { VoidFn } from "@polkadot/api/types"
import { Codec } from "@polkadot/types/types"
import {
  MONEY_MARKET_LAUNCH_BLOCK_NUMBER,
  MONEY_MARKET_REFERENDUM_INDEX,
} from "sections/lending/ui-config/misc"

const MONEY_MARKET_REFERENDUM_LINK = `${import.meta.env.VITE_REFERENDUM_LINK}/${MONEY_MARKET_REFERENDUM_INDEX}`

const AVG_BLOCK_TIME = 13.9

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
  const { api } = useRpcProvider()
  const isTestnet = useIsTestnet()
  const { t } = useTranslation()
  const now = useRef(Date.now())
  const bestNumber = useBestNumber()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const aavePoolContract = isTestnet
      ? AaveV3HydrationTestnet.POOL
      : AaveV3HydrationMainnet.POOL

    let result: Codec | VoidFn | undefined = undefined

    async function checkApprovedContract() {
      const unsub = await api.query.evmAccounts.approvedContract(
        aavePoolContract,
        async (result: Codec) => {
          if (!result.isEmpty) {
            // reload the page when the AAVE Pool contract is approved
            window.location.reload()
          }
        },
      )

      result = unsub
    }

    checkApprovedContract()

    return () => {
      if (typeof result === "function") {
        result()
      }
    }
  }, [api.query.evmAccounts, isTestnet])

  const timestampDiff = useMemo(() => {
    if (bestNumber?.data) {
      return BN(MONEY_MARKET_LAUNCH_BLOCK_NUMBER)
        .minus(bestNumber.data?.parachainBlockNumber.toBigNumber() ?? 0)
        .times(AVG_BLOCK_TIME * 1000)
        .toNumber()
    }

    return 0
  }, [bestNumber])

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
