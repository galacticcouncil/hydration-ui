import type {
  Finding,
  FindingCode,
  FindingParams,
} from "@galacticcouncil/money-market-v2/types"
import { Alert, Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

/** v2's codes plus the ones only the app can assess. */
export type AppFindingCode = FindingCode | "openDca"

export type AppFinding = Finding<AppFindingCode>

type Props = {
  readonly findings: readonly AppFinding[]
  /** Only needed by actions whose assessment can ask for acknowledgement. */
  readonly acknowledged?: boolean
  readonly onAcknowledgedChange?: (acknowledged: boolean) => void
}

const toInterpolation = (params: FindingParams) =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(", ") : value,
    ]),
  )

export const FindingsList: FC<Props> = ({
  findings,
  acknowledged = false,
  onAcknowledgedChange,
}) => {
  const { t } = useTranslation("moneyMarket")

  const blockers = findings.filter((finding) => finding.kind === "blocker")
  const acknowledgements = findings.filter(
    (finding) => finding.kind === "acknowledgement",
  )
  const notices = findings.filter((finding) => finding.kind === "notice")

  if (findings.length === 0) {
    return null
  }

  const describe = (finding: AppFinding) =>
    t(`finding.${finding.code}`, toInterpolation(finding.params))

  return (
    <Flex direction="column" gap="base">
      {blockers.map((finding) => (
        <Alert
          key={finding.code}
          variant="error"
          description={describe(finding)}
        />
      ))}
      {acknowledgements.map((finding, index) => (
        <Alert
          key={finding.code}
          variant="warning"
          description={describe(finding)}
          // one toggle accepts them all, so it sits in the last alert
          action={
            index === acknowledgements.length - 1 && (
              <Flex align="center" as="label" gap="base">
                <Toggle
                  size="large"
                  checked={acknowledged}
                  onCheckedChange={(checked) => onAcknowledgedChange?.(checked)}
                />
                <Text fs="p4" lh={1.3} fw={600}>
                  {t("acknowledgeRisks")}
                </Text>
              </Flex>
            )
          }
        />
      ))}
      {notices.map((finding) => (
        <Alert
          key={finding.code}
          variant={finding.tone}
          description={describe(finding)}
        />
      ))}
    </Flex>
  )
}
