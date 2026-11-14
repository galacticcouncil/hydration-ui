import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleDotIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  TextButton,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

type BankTimelineProps = {
  /** The stage names, in order (only names a table of the API doc gives). */
  stages: ReadonlyArray<string>
  /** Stages the server's status reaches; the last of them is the current one. */
  lit: number
  /** The current stage's text: the server's label (and our copy of its detail code). */
  current: { label: string; detail?: string | null }
  /** Every stage is done (the server's final status, Paid or Credited). */
  complete: boolean
}

/**
 * Figma pattern P04: the completed stages collapse into "N completed steps"
 * (expandable), then the current stage with the server's own label, then the
 * stages not reached yet, greyed. A visual only: it never lights a stage the
 * status does not reach, and the caller hides it for an off-timeline status.
 */
export const BankTimeline: FC<BankTimelineProps> = ({
  stages,
  lit,
  current,
  complete,
}) => {
  const { t } = useTranslation(["onramp"])
  const [open, setOpen] = useState(false)
  // Complete: every stage but the last is "completed", the last is current.
  const doneCount = complete ? stages.length - 1 : Math.max(lit - 1, 0)
  const done = stages.slice(0, doneCount)
  const upcoming = complete ? [] : stages.slice(lit)

  return (
    <Stack gap="m" data-timeline-lit={lit} data-timeline-complete={complete}>
      {doneCount > 0 && (
        <Flex align="center" gap="s">
          <Icon
            component={CheckIcon}
            size="s"
            color={getToken("accents.success.emphasis")}
          />
          <Text fs="p4" fw={500} sx={{ flex: 1 }}>
            {t("bank.timeline.completed", { count: doneCount })}
          </Text>
          <TextButton onClick={() => setOpen((v) => !v)}>
            <Icon component={open ? ChevronUpIcon : ChevronDownIcon} size="s" />
          </TextButton>
        </Flex>
      )}
      {open &&
        done.map((name) => (
          <Flex key={name} align="center" gap="s" data-stage-done={name}>
            <Icon
              component={CheckIcon}
              size="s"
              color={getToken("accents.success.emphasis")}
            />
            <Text fs="p5" color={getToken("text.medium")}>
              {name}
            </Text>
          </Flex>
        ))}
      <Flex
        gap="s"
        data-stage-current={
          complete ? stages[stages.length - 1] : stages[lit - 1]
        }
      >
        <Box pt="xs">
          <Icon
            component={complete ? CheckIcon : CircleDotIcon}
            size="s"
            color={getToken(
              complete ? "accents.success.emphasis" : "text.tint.secondary",
            )}
          />
        </Box>
        <Stack gap="xs">
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {current.label}
          </Text>
          {current.detail && (
            <Text fs="p5" color={getToken("text.medium")}>
              {current.detail}
            </Text>
          )}
        </Stack>
      </Flex>
      {upcoming.map((name) => (
        <Flex key={name} align="center" gap="s" data-stage-upcoming={name}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "full",
              border: "1px solid",
              borderColor: getToken("details.borders"),
            }}
          />
          <Text fs="p5" color={getToken("text.low")}>
            {name}
          </Text>
        </Flex>
      ))}
    </Stack>
  )
}
