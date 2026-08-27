import {
  BadgeDollarSign,
  CirclePause,
  MoveHorizontal,
  RefreshCw,
  SlidersHorizontal,
  WalletCards,
} from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  ResponsiveScope,
  Separator,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentType, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  LiquidityDistribution,
  RangeScenario,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution"
import {
  SExplainerSplit,
  SExplainerSplitDivider,
} from "@/modules/liquidity/VaultDetails.styled"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

type ScenarioCopy = {
  title: string
  description: string
  facts: ReadonlyArray<{
    icon: ComponentType
    title: string
    description: string
  }>
}

export const VaultExplainer = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [scenario, setScenario] = useState<RangeScenario>("inRange")

  const options: ReadonlyArray<{ id: RangeScenario; label: string }> = [
    { id: "inRange", label: t("vaults.explainer.states.inRange") },
    { id: "outOfRange", label: t("vaults.explainer.states.outOfRange") },
    { id: "recentered", label: t("vaults.explainer.states.recentered") },
  ]

  const copy: Record<RangeScenario, ScenarioCopy> = {
    inRange: {
      title: t("vaults.explainer.inRange.title"),
      description: t("vaults.explainer.inRange.description"),
      facts: [
        {
          icon: BadgeDollarSign,
          title: t("vaults.explainer.inRange.fees.title"),
          description: t("vaults.explainer.inRange.fees.description"),
        },
        {
          icon: SlidersHorizontal,
          title: t("vaults.explainer.inRange.ticks.title"),
          description: t("vaults.explainer.inRange.ticks.description"),
        },
      ],
    },
    outOfRange: {
      title: t("vaults.explainer.outOfRangeState.title"),
      description: t("vaults.explainer.outOfRangeState.description"),
      facts: [
        {
          icon: CirclePause,
          title: t("vaults.explainer.outOfRangeState.deposits.title"),
          description: t(
            "vaults.explainer.outOfRangeState.deposits.description",
          ),
        },
        {
          icon: WalletCards,
          title: t("vaults.explainer.outOfRangeState.withdraw.title"),
          description: t(
            "vaults.explainer.outOfRangeState.withdraw.description",
          ),
        },
      ],
    },
    recentered: {
      title: t("vaults.explainer.recentered.title"),
      description: t("vaults.explainer.recentered.description"),
      facts: [
        {
          icon: MoveHorizontal,
          title: t("vaults.explainer.recentered.range.title"),
          description: t("vaults.explainer.recentered.range.description"),
        },
        {
          icon: RefreshCw,
          title: t("vaults.explainer.recentered.compound.title"),
          description: t("vaults.explainer.recentered.compound.description"),
        },
      ],
    },
  }

  const selected = copy[scenario]

  return (
    <Paper sx={{ p: "l", flex: 2.5, minWidth: 0 }}>
      <Text as="h2" fs="base" fw={500} font="primary">
        {t("vaults.explainer.title")}
      </Text>
      <Text fs="p6" color={getToken("text.low")} sx={{ mt: "xs" }}>
        {t("vaults.explainer.hint")}
      </Text>

      <Flex sx={{ mt: "m" }}>
        <ToggleGroup
          type="single"
          value={scenario}
          onValueChange={(value) =>
            value && setScenario(value as RangeScenario)
          }
        >
          {options.map((option) => (
            <ToggleGroupItem key={option.id} value={option.id}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Flex>

      <ResponsiveScope sx={{ mt: "l" }}>
        <SExplainerSplit>
          <Flex
            direction="column"
            justify="center"
            sx={{ flex: 3, minWidth: 0, pointerEvents: "none" }}
          >
            <LiquidityDistribution
              vault={vault}
              scenario={scenario}
              height={180}
            />
          </Flex>

          <SExplainerSplitDivider />

          <Flex direction="column" gap="m" sx={{ flex: 2, minWidth: 0 }}>
            <Flex direction="column" gap="s">
              <Text as="h3" fs="p2" fw={500} font="primary">
                {selected.title}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {selected.description}
              </Text>
            </Flex>

            {selected.facts.map((fact) => (
              <Flex key={fact.title} align="flex-start" gap="m" asChild>
                <Paper borderRadius="m" shadow={false} sx={{ p: "m" }}>
                  <Icon
                    component={fact.icon}
                    size="m"
                    color={getToken("buttons.primary.high.rest")}
                    sx={{ mt: "xs" }}
                  />
                  <Flex direction="column" gap="xs">
                    <Text fs="p5" fw={600}>
                      {fact.title}
                    </Text>
                    <Text fs="p6" color={getToken("text.low")}>
                      {fact.description}
                    </Text>
                  </Flex>
                </Paper>
              </Flex>
            ))}
          </Flex>
        </SExplainerSplit>
      </ResponsiveScope>

      <Separator sx={{ my: "m" }} />
      <Text fs="p6" color={getToken("text.low")}>
        {t("vaults.explainer.footer")}
      </Text>
    </Paper>
  )
}
