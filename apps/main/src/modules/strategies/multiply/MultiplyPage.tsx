import {
  Box,
  Flex,
  Paper,
  SectionHeader,
  Separator,
  Spinner,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Navigate, useNavigate, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { ReserveApyProvider } from "@/modules/money-market/apy/ReserveApyProvider"
import { MultiplyDetailsCard } from "@/modules/strategies/multiply/components/MultiplyDetailsCard"
import { MultiplyHeader } from "@/modules/strategies/multiply/components/MultiplyHeader"
import { MultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm"
import { MultiplyPairSelectModal } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal"
import { MultiplyPositionsCard } from "@/modules/strategies/multiply/components/MultiplyPositionsCard"
import {
  getMultiplyPair,
  MULTIPLY_PAIRS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { useMultiplyPairsMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useMultiplyPositions } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { useRpcProvider } from "@/providers/rpcProvider"

const MultiplyPageContent: React.FC = () => {
  const { t } = useTranslation("strategies")
  const search = useSearch({ from: "/strategies/multiply/" })
  const navigate = useNavigate({ from: "/strategies/multiply/" })
  const pairs = useMultiplyPairsMetrics()
  const { data: positions } = useMultiplyPositions()
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  // an unknown or missing ?pair= falls back to the first configured pair
  const pair = getMultiplyPair(search.pair ?? "") ?? MULTIPLY_PAIRS[0]!
  const selected = pairs.find((p) => p.pair.slug === pair.slug)!

  // below md the grid stacks into one column, so the page splits into tabs
  const { gte } = useBreakpoints()
  const stacked = !gte("md")
  const [tab, setTab] = useState<"overview" | "positions">("overview")
  const hasPositions = !!positions?.length
  const showOverview = !stacked || !hasPositions || tab === "overview"
  const showPositions = !stacked || (hasPositions && tab === "positions")

  const selectPair = (next: MultiplyPair) =>
    navigate({ search: { pair: next.slug }, replace: true })

  return (
    <Stack gap="xxl">
      <MultiplyHeader />

      {stacked && hasPositions && (
        <ToggleGroup
          type="single"
          fullWidth
          value={tab}
          onValueChange={(value) => value && setTab(value)}
        >
          <ToggleGroupItem value="overview">
            {t("multiply.tab.overview")}
          </ToggleGroupItem>
          <ToggleGroupItem value="positions">
            {t("multiply.tab.myPositions")}
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" minWidth={0} sx={{ order: [1, null, 0] }}>
          {showPositions && <MultiplyPositionsCard pairs={pairs} />}

          {showOverview && (
            <>
              <MultiplyDetailsCard pairs={pairs} />

              <Paper p="xl">
                <SectionHeader
                  title={t("about.title", { suffix: t("multiply.name") })}
                  as="h2"
                  noTopPadding
                />
                <Separator mx="-xl" mb="xl" />
                <Markdown id="multiply" muted size="small" />
              </Paper>
            </>
          )}
        </Stack>

        {showOverview && (
          <Box minWidth={0}>
            {selected.data &&
            selected.collateralReserve &&
            selected.debtReserve ? (
              <MultiplyOpenForm
                // a new pair is a new collateral: start the form over
                key={pair.slug}
                pair={pair}
                metrics={selected.data}
                collateralPriceUsd={Number(
                  selected.collateralReserve.priceInUsd,
                )}
                debtPriceUsd={Number(selected.debtReserve.priceInUsd)}
                onPairClick={() => setIsSelectOpen(true)}
              />
            ) : (
              <Flex justify="center" p="xl">
                <Spinner />
              </Flex>
            )}
          </Box>
        )}
      </TwoColumnGrid>

      {isSelectOpen && (
        <MultiplyPairSelectModal
          pairs={pairs}
          selected={pair}
          onSelect={selectPair}
          onClose={() => setIsSelectOpen(false)}
        />
      )}
    </Stack>
  )
}

export const MultiplyPage: React.FC = () => {
  const { featureFlags, isReady } = useRpcProvider()

  if (isReady && !featureFlags.looperEnabled) {
    return <Navigate to="/strategies" />
  }

  return (
    <ReserveApyProvider>
      <MultiplyPageContent />
    </ReserveApyProvider>
  )
}
