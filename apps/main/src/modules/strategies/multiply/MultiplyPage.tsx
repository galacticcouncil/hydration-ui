import {
  Box,
  Paper,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Navigate, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { ReserveApyProvider } from "@/modules/money-market/apy/ReserveApyProvider"
import { CustomLoopWizard } from "@/modules/strategies/multiply/components/CustomLoopWizard"
import { MultiplyAboutCard } from "@/modules/strategies/multiply/components/MultiplyAboutCard"
import { MultiplyDepositModal } from "@/modules/strategies/multiply/components/MultiplyDepositModal"
import { MultiplyDetailsCard } from "@/modules/strategies/multiply/components/MultiplyDetailsCard"
import { MultiplyHeader } from "@/modules/strategies/multiply/components/MultiplyHeader"
import { MultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm"
import { MultiplyPairDetailsModal } from "@/modules/strategies/multiply/components/MultiplyPairDetailsModal"
import { MultiplyPairSelectModal } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal"
import { MultiplyPositionsCard } from "@/modules/strategies/multiply/components/MultiplyPositionsCard"
import {
  findPairByAssets,
  isCustomLoop,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import {
  useCustomLoopsStore,
  useMultiplyPairs,
} from "@/modules/strategies/multiply/hooks/useCustomLoops"
import {
  useLoopBuilder,
  useMultiplyPairsMetrics,
} from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useMultiplyPositions } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { getLoopsToRestore } from "@/modules/strategies/multiply/utils/loops"
import { useRpcProvider } from "@/providers/rpcProvider"

const MultiplyPageContent: React.FC = () => {
  const { t } = useTranslation("strategies")
  const search = useSearch({ from: "/strategies/looper/" })
  const navigate = useNavigate({ from: "/strategies/looper/" })
  const allPairs = useMultiplyPairs()
  const pairs = useMultiplyPairsMetrics(allPairs)
  const { data: positions } = useMultiplyPositions()
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [depositSlug, setDepositSlug] = useState<string | null>(null)
  const [detailsSlug, setDetailsSlug] = useState<string | null>(null)
  const addLoop = useCustomLoopsStore((s) => s.add)
  const { build, isReady: isBuilderReady } = useLoopBuilder()

  // an unknown or missing ?pair= falls back to the first preset
  const pair = allPairs.find((p) => p.slug === search.pair) ?? allPairs[0]!
  const selected = pairs.find((p) => p.pair.slug === pair.slug)!

  const selectPair = (next: MultiplyPair) =>
    navigate({ search: { pair: next.slug }, replace: true })

  // A position on a loop missing from the list (another device, or removed)
  // puts the loop back, so the table, selector and positions agree.
  useEffect(() => {
    getLoopsToRestore(
      (positions ?? []).map((p) => p.pair),
      allPairs,
      isCustomLoop,
    ).forEach(addLoop)
  }, [positions, allPairs, addLoop])

  // ?collateral=&debt= saves a valid loop and selects it; anything else falls back
  const { collateral: linkCollateral, debt: linkDebt } = search
  useEffect(() => {
    if (!linkCollateral || !linkDebt || !isBuilderReady) return
    const preset = findPairByAssets(allPairs, linkCollateral, linkDebt)
    const built =
      linkCollateral !== linkDebt ? build(linkCollateral, linkDebt) : null
    if (built && !preset)
      addLoop({ collateralAssetId: linkCollateral, debtAssetId: linkDebt })
    navigate({
      search: { pair: (preset ?? built)?.slug },
      replace: true,
    })
  }, [
    linkCollateral,
    linkDebt,
    isBuilderReady,
    allPairs,
    build,
    addLoop,
    navigate,
  ])

  // below md the grid stacks into one column, so the page splits into tabs
  const { gte } = useBreakpoints()
  const stacked = !gte("md")
  const [tab, setTab] = useState<"overview" | "positions">("overview")
  const hasPositions = !!positions?.length
  const showOverview = !stacked || !hasPositions || tab === "overview"
  const showPositions = !stacked || (hasPositions && tab === "positions")

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
              <MultiplyDetailsCard
                pairs={pairs}
                onCustomLoop={() => setIsWizardOpen(true)}
                onDeposit={(next) => {
                  selectPair(next)
                  setDepositSlug(next.slug)
                }}
                onDetails={(next) => setDetailsSlug(next.slug)}
              />

              <MultiplyAboutCard />
            </>
          )}
        </Stack>

        {showOverview && (
          <Box minWidth={0}>
            <Paper px="xl">
              <MultiplyOpenForm
                key={pair.slug}
                pair={pair}
                metrics={selected.data}
                risk={selected.risk}
                collateralReserve={selected.collateralReserve}
                debtReserve={selected.debtReserve}
                onPairClick={() => setIsSelectOpen(true)}
              />
            </Paper>
          </Box>
        )}
      </TwoColumnGrid>

      {isWizardOpen && (
        <CustomLoopWizard
          onClose={() => setIsWizardOpen(false)}
          onSelect={selectPair}
        />
      )}

      <MultiplyDepositModal
        row={pairs.find((p) => p.pair.slug === depositSlug) ?? null}
        onClose={() => setDepositSlug(null)}
      />

      <MultiplyPairDetailsModal
        row={pairs.find((p) => p.pair.slug === detailsSlug) ?? null}
        onClose={() => setDetailsSlug(null)}
      />

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
