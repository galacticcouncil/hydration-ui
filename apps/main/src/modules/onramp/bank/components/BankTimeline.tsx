import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

type MarkerState = "done" | "current" | "pending"

const TimelineMarker: FC<{ state: MarkerState }> = ({ state }) => (
  <Flex
    as="span"
    aria-hidden
    align="center"
    justify="center"
    sx={{
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: "full",
      border: state === "pending" ? "1px solid" : undefined,
      borderColor: getToken("details.borders"),
      backgroundColor:
        state === "done"
          ? getToken("accents.success.dim")
          : state === "current"
            ? getToken("colors.azureBlue.alpha.500")
            : undefined,
    }}
  >
    {state === "done" && (
      <Icon
        component={CheckIcon}
        size="s"
        color={getToken("accents.success.emphasis")}
      />
    )}
    {state === "current" && (
      <Box
        as="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: "full",
          bg: getToken("colors.azureBlue.500"),
        }}
      />
    )}
  </Flex>
)

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
    <Stack
      data-timeline-lit={lit}
      data-timeline-complete={complete}
      sx={{
        "& > [data-stage-done], & > [data-stage-current], & > [data-stage-upcoming]":
          {
            px: "m",
          },
        "& > :first-child:has(button)::before": {
          top: 44,
        },
        "& > :not(:last-child)": {
          position: "relative",
          paddingBottom: "l",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 9,
            ml: "m",
            top: 22,
            bottom: 2,
            width: 2,
            bg: getToken("details.separators"),
          },
        },
      }}
    >
      {doneCount > 0 && (
        <Box>
          <TextButton
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            sx={{
              width: "100%",
              minHeight: 44,
              px: "m",
              gap: "m",
              borderRadius: "m",
              bg: getToken("surfaces.containers.dim.dimOnHigh"),
              textAlign: "left",
              "&:hover": { bg: getToken("details.separators") },
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: getToken("colors.azureBlue.500"),
                outlineOffset: 2,
              },
            }}
          >
            <TimelineMarker state="done" />
            <Text
              as="span"
              fs="p4"
              fw={500}
              color={getToken("text.high")}
              sx={{ flex: 1 }}
            >
              {t("bank.timeline.completed", { count: doneCount })}
            </Text>
            <Icon component={open ? ChevronUpIcon : ChevronDownIcon} size="s" />
          </TextButton>
        </Box>
      )}
      {open &&
        done.map((name) => (
          <Flex key={name} align="center" gap="m" data-stage-done={name}>
            <TimelineMarker state="done" />
            <Text fs="p5" color={getToken("text.medium")}>
              {name}
            </Text>
          </Flex>
        ))}
      <Flex
        gap="m"
        aria-current={complete ? undefined : "step"}
        data-stage-current={
          complete ? stages[stages.length - 1] : stages[lit - 1]
        }
      >
        <TimelineMarker state={complete ? "done" : "current"} />
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
        <Flex key={name} align="center" gap="m" data-stage-upcoming={name}>
          <TimelineMarker state="pending" />
          <Text fs="p5" color={getToken("text.low")}>
            {name}
          </Text>
        </Flex>
      ))}
    </Stack>
  )
}
