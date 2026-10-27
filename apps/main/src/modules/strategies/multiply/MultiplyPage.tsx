import {
  Flex,
  Paper,
  SectionHeader,
  Separator,
  Spinner,
  Stack,
} from "@galacticcouncil/ui/components"
import { Navigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { ReserveApyProvider } from "@/modules/money-market/apy/ReserveApyProvider"
import { MultiplyDetailsCard } from "@/modules/strategies/multiply/components/MultiplyDetailsCard"
import { MultiplyHeader } from "@/modules/strategies/multiply/components/MultiplyHeader"
import { MultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm"
import { MultiplyPositionsCard } from "@/modules/strategies/multiply/components/MultiplyPositionsCard"
import {
  getMultiplyPair,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { useMultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useRpcProvider } from "@/providers/rpcProvider"

export type MultiplyPageProps = {
  pairId: string
}

const MultiplyPageContent: React.FC<{ pair: MultiplyPair }> = ({ pair }) => {
  const { t } = useTranslation("strategies")
  const { data, collateralReserve, debtReserve, isLoading } =
    useMultiplyPairMetrics(pair)

  return (
    <Stack gap="xxl">
      <MultiplyHeader pair={pair} />

      {data && collateralReserve && debtReserve ? (
        <TwoColumnGrid template="sidebar">
          <Stack gap="xl" sx={{ order: [1, null, 0] }}>
            <MultiplyPositionsCard
              pair={pair}
              collateralPriceUsd={Number(collateralReserve.priceInUsd)}
            />

            <MultiplyDetailsCard
              pair={pair}
              metrics={data}
              isLoading={isLoading}
            />

            <Paper p="xl">
              <SectionHeader
                title={t("about.title", { suffix: t("multiply.name") })}
                as="h2"
                noTopPadding
              />
              <Separator mx="-xl" mb="xl" />
              <Markdown id="multiply" muted size="small" />
            </Paper>
          </Stack>

          <MultiplyOpenForm
            pair={pair}
            metrics={data}
            collateralPriceUsd={Number(collateralReserve.priceInUsd)}
            debtPriceUsd={Number(debtReserve.priceInUsd)}
          />
        </TwoColumnGrid>
      ) : (
        <Flex justify="center" p="xl">
          <Spinner />
        </Flex>
      )}
    </Stack>
  )
}

export const MultiplyPage: React.FC<MultiplyPageProps> = ({ pairId }) => {
  const { featureFlags, isReady } = useRpcProvider()
  const pair = getMultiplyPair(pairId)

  if (isReady && (!featureFlags.looperEnabled || !pair)) {
    return <Navigate to="/strategies" />
  }

  if (!pair) return null

  return (
    <ReserveApyProvider>
      <MultiplyPageContent pair={pair} />
    </ReserveApyProvider>
  )
}
