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
  Separator,
  SliderTabs,
  SliderTabsOption,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentType, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  LiquidityDistribution,
  RangeScenario,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution"
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

/** Interactive, plain-language walkthrough of the managed range lifecycle. */
export const VaultExplainer = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [scenario, setScenario] = useState<RangeScenario>("inRange")

  const options: ReadonlyArray<SliderTabsOption<RangeScenario>> = [
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
    <Paper sx={{ p: "l", flex: 2, minWidth: 0 }}>
      <Text as="h2" fs="base" fw={500} font="primary">
        {t("vaults.explainer.title")}
      </Text>
      <Text fs="p6" color={getToken("text.low")} sx={{ mt: "xs" }}>
        {t("vaults.explainer.hint")}
      </Text>

      <Flex sx={{ mt: "m" }}>
        <SliderTabs
          options={options}
          selected={scenario}
          onSelect={(option) => setScenario(option.id)}
        />
      </Flex>

      <Flex
        direction={["column", "column", "row"]}
        align="stretch"
        sx={{ mt: "l" }}
      >
        <Flex
          direction="column"
          justify="center"
          sx={{ flex: 2.5, minWidth: 0, pointerEvents: "none" }}
        >
          <LiquidityDistribution
            vault={vault}
            scenario={scenario}
            height={200}
          />
        </Flex>

        <Separator
          orientation={["horizontal", "horizontal", "vertical"]}
          sx={{ alignSelf: "stretch", my: ["l", "l", 0], mx: [0, 0, "xl"] }}
        />

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
            <Flex
              key={fact.title}
              align="flex-start"
              gap="m"
              sx={{
                p: "m",
                border: "1px solid",
                borderColor: getToken("details.separators"),
                borderRadius: "m",
              }}
            >
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
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Separator sx={{ my: "m" }} />
      <Text fs="p6" color={getToken("text.low")}>
        {t("vaults.explainer.footer")}
      </Text>
    </Paper>
  )
}
