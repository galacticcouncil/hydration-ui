import { Button, Collapsible, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import PrimeIcon from "@/modules/strategies/assets/PrimeIcon.svg?react"
import {
  SAssetCell,
  SAssetIcon,
  SPositionsCard,
  SPositionsStats,
  SStat,
  SSubTr,
  STable,
  STd,
  STh,
  STr,
} from "@/modules/strategies/components/MyPositions.styled"

type SubPosition = {
  id: string
  name: string
  leverage: number
  value: string
  amount: string
  pnl: string
  pnlPercent: string
  apy: string
  hf: string
}

type Position = {
  id: string
  name: string
  leverage: number
  value: string
  positions: number
  hf: string
  hfPercent: string
  subPositions?: SubPosition[]
  hasGoToPair?: boolean
}

const MOCK_POSITIONS: Position[] = [
  {
    id: "prime-1",
    name: "Prime",
    leverage: 2.0,
    value: "$152.245",
    positions: 5,
    hf: "+$52.24",
    hfPercent: "5.45%",
    subPositions: [
      { id: "prime-husd-1", name: "PRIME/ HUSD", leverage: 2.0, value: "$152.24", amount: "1223 Prime", pnl: "+$52.24", pnlPercent: "5.45%", apy: "5.45%", hf: "2.24" },
      { id: "prime-husd-2", name: "PRIME/ HUSD", leverage: 2.0, value: "$152.24", amount: "1223 Prime", pnl: "+$52.24", pnlPercent: "5.45%", apy: "5.45%", hf: "2.24" },
      { id: "prime-husd-3", name: "PRIME/ HUSD", leverage: 2.0, value: "$152.24", amount: "1223 Prime", pnl: "+$52.24", pnlPercent: "5.45%", apy: "5.45%", hf: "2.24" },
    ],
  },
  {
    id: "prime-2",
    name: "Prime",
    leverage: 2.0,
    value: "$152.24",
    positions: 5,
    hf: "+$52.24",
    hfPercent: "5.45%",
    hasGoToPair: true,
  },
  {
    id: "gdot-1",
    name: "GDOT",
    leverage: 2.0,
    value: "$152.24",
    positions: 5,
    hf: "+$52.24",
    hfPercent: "5.45%",
  },
]

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Prime: PrimeIcon,
  "PRIME/ HUSD": PrimeIcon,
}

const PositionIcon = ({ name }: { name: string }) => {
  const Icon = ICON_MAP[name]
  if (Icon) return <Icon width={32} height={32} />
  return <SAssetIcon>{name.charAt(0)}</SAssetIcon>
}

export const MyPositions = () => {
  const { t } = useTranslation("strategies")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["prime-1"]))

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <SPositionsCard>
      <Collapsible
        defaultOpen
        label={
          <Text fs="p4" fw={600} color={getToken("text.high")}>
            {t("positions.title")}
          </Text>
        }
        actionLabel={t("positions.show")}
        actionLabelWhenOpen={t("positions.hide")}
      >
        <SPositionsStats>
          <SStat>
            <Text fs="p5" color={getToken("text.low")}>
              {t("positions.openedPositions")}
            </Text>
            <Text fs="h3" fw={700} color={getToken("text.high")}>
              $2344
            </Text>
          </SStat>
          <SStat>
            <Text fs="p5" color={getToken("text.low")}>
              {t("positions.positionsValue")}
            </Text>
            <Text fs="h3" fw={700} color={getToken("text.high")}>
              $21 874
            </Text>
          </SStat>
          <SStat>
            <Text fs="p5" color={getToken("text.low")}>
              {t("positions.avgLeverage")}
            </Text>
            <Text fs="h3" fw={700} color={getToken("state.success.default")}>
              3.4
            </Text>
          </SStat>
        </SPositionsStats>

        <STable>
          <thead>
            <tr>
              <STh>{t("positions.table.position")}</STh>
              <STh>{t("positions.table.value")}</STh>
              <STh>{t("positions.table.positions")}</STh>
              <STh>{t("positions.table.hf")}</STh>
              <STh>{t("positions.table.actions")}</STh>
            </tr>
          </thead>
          <tbody>
            {MOCK_POSITIONS.map((pos) => (
              <>
                <STr
                  key={pos.id}
                  onClick={() => pos.subPositions && toggleRow(pos.id)}
                  style={{ cursor: pos.subPositions ? "pointer" : "default" }}
                >
                  <STd>
                    <SAssetCell>
                      <PositionIcon name={pos.name} />
                      <div>
                        <Text fs="p4" fw={600}>{pos.name}</Text>
                        <Text fs="p5" color={getToken("text.low")}>
                          {t("positions.leverage", { value: pos.leverage })}
                        </Text>
                      </div>
                    </SAssetCell>
                  </STd>
                  <STd>{pos.value}</STd>
                  <STd>{pos.positions}</STd>
                  <STd>
                    <Text color={getToken("state.success.default")}>{pos.hf}</Text>
                    <Text fs="p5" color={getToken("text.low")}>({pos.hfPercent})</Text>
                  </STd>
                  <STd>
                    <Flex justify="flex-end" gap="s">
                      {pos.hasGoToPair ? (
                        <Button size="small" variant="secondary">
                          {t("positions.table.goToPair")}
                        </Button>
                      ) : (
                        <Button size="small" variant="tertiary">
                          {t("positions.table.close")}
                        </Button>
                      )}
                    </Flex>
                  </STd>
                </STr>

                {pos.subPositions && expandedRows.has(pos.id) && (
                  <>
                    <tr>
                      <STh style={{ paddingLeft: 32 }}>{t("positions.table.position")}</STh>
                      <STh>{t("positions.table.value")}</STh>
                      <STh>{t("positions.table.amount")}</STh>
                      <STh>{t("positions.table.pnl")}</STh>
                      <STh>{t("positions.table.apy")}</STh>
                      <STh>{t("positions.table.hf")}</STh>
                      <STh>{t("positions.table.actions")}</STh>
                    </tr>
                    {pos.subPositions.map((sub) => (
                      <SSubTr key={sub.id}>
                        <STd>
                          <SAssetCell>
                            <PositionIcon name={sub.name} />
                            <div>
                              <Text fs="p4" fw={600}>{sub.name}</Text>
                              <Text fs="p5" color={getToken("text.low")}>
                                {t("positions.leverage", { value: sub.leverage })}
                              </Text>
                            </div>
                          </SAssetCell>
                        </STd>
                        <STd>{sub.value}</STd>
                        <STd>{sub.amount}</STd>
                        <STd>
                          <Text color={getToken("state.success.default")}>{sub.pnl}</Text>
                          <Text fs="p5" color={getToken("text.low")}>({sub.pnlPercent})</Text>
                        </STd>
                        <STd>{sub.apy}</STd>
                        <STd>
                          <Text color={getToken("state.warning.default")}>{sub.hf}</Text>
                        </STd>
                        <STd>
                          <Button size="small" variant="tertiary">
                            {t("positions.table.close")}
                          </Button>
                        </STd>
                      </SSubTr>
                    ))}
                  </>
                )}
              </>
            ))}
          </tbody>
        </STable>
      </Collapsible>
    </SPositionsCard>
  )
}
