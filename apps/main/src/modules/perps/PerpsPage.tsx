import { Alert, Grid, Stack } from "@galacticcouncil/ui/components"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { PerpsApproval } from "@/modules/perps/components/PerpsApproval"
import { PerpsBottomPanel } from "@/modules/perps/components/PerpsBottomPanel"
import { PerpsChart } from "@/modules/perps/components/PerpsChart"
import { PerpsMarketHeader } from "@/modules/perps/components/PerpsMarketHeader"
import { PerpsMarketSelect } from "@/modules/perps/components/PerpsMarketSelect"
import { PerpsOrderBook } from "@/modules/perps/components/PerpsOrderBook"
import { PerpsOrderTicket } from "@/modules/perps/components/PerpsOrderTicket"
import { PerpsMarket, useAllMarkets } from "@/modules/perps/PerpsPage.data"

export const PerpsPage = () => {
  const { t } = useTranslation("trade")
  const wallet = useWallet()
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [symbol, setSymbol] = useState("BTC")
  // Clicking a book level pre-fills the ticket's limit price.
  const [presetPrice, setPresetPrice] = useState("")

  const { markets } = useAllMarkets()
  const market = markets.find((m) => m.symbol === symbol)
  const isSpot = market?.type === "spot"

  /**
   * Hyperliquid authenticates by recovering an ECDSA signer, so a Substrate
   * account cannot trade there. Its "EVM address" is the first 20 bytes of the
   * sr25519 public key — a real address on Hydration's EVM, but one no key can
   * ever sign for. Showing that account here would be actively misleading.
   */
  const canTrade = isEthereumSigner(wallet?.signer)

  return (
    <Stack gap="l">
      {!canTrade && (
        <Alert
          variant="info"
          title={t("perps.evmRequired.title")}
          description={t("perps.evmRequired.description")}
        />
      )}

      {canTrade && <PerpsApproval />}

      <PerpsMarketHeader
        market={market}
        isSpot={isSpot}
        onOpenSelect={() => setIsSelectOpen(true)}
      />

      {/* Columns differ a lot in height; without this the short ones stretch
          and leave dead space under the chart. */}
      <Grid
        columns={["1fr", "1fr", "2.2fr 1fr 1.1fr"]}
        gap="l"
        sx={{ alignItems: "start" }}
      >
        <PerpsChart symbol={symbol} coin={market?.wire ?? symbol} />

        <PerpsOrderBook
          coin={market?.wire ?? symbol}
          onPriceSelect={setPresetPrice}
        />

        {canTrade && (
          <PerpsOrderTicket
            symbol={symbol}
            markPx={market?.markPx ?? "0"}
            maxLeverage={market?.maxLeverage ?? 1}
            isSpot={isSpot}
            presetPrice={presetPrice}
          />
        )}
      </Grid>

      {canTrade && <PerpsBottomPanel />}

      <PerpsMarketSelect
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
        onSelect={(selected: PerpsMarket) => setSymbol(selected.symbol)}
      />
    </Stack>
  )
}
