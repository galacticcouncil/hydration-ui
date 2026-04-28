import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Slider,
  Stack,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"

type Props = {
  referendumId: number
  open: boolean
  onClose: () => void
}

type VoteType = "aye" | "nay" | "split" | "abstain"

const MULTIPLIER_LABELS = ["0x", "1x", "2x", "3x", "4x", "5x", "6x"]

const LOCK_DURATION_DAYS = [0, 7, 14, 27, 56, 112, 224]

const VoteValueField: FC<{ label: string }> = ({ label }) => (
  <Stack direction="column" gap="s">
    <Text fs="p5" fw={500}>
      {label}
    </Text>
    <Input value="0" unit="HDX" readOnly />
  </Stack>
)

export const VoteModal: FC<Props> = ({ open, onClose }) => {
  const [voteType, setVoteType] = useState<VoteType>("aye")
  const [multiplier, setMultiplier] = useState(0)
  const lockDays = LOCK_DURATION_DAYS[multiplier] ?? 0

  const showMultiplierAndSummary = voteType === "aye" || voteType === "nay"

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <ModalHeader title="Referendum vote" />
      <ModalBody>
        <Stack direction="column" gap="l">
          <Stack direction="column" gap="m">
            <Flex justify="space-between" align="center">
              <Text fs="p5" fw={500}>
                Origin
              </Text>
              <Flex gap="xs" align="center">
                <Text fs="p5" color={getToken("text.medium")}>
                  Voting Balance
                </Text>
                <Text fs="p5" fw={500}>
                  0 HDX
                </Text>
              </Flex>
            </Flex>

            <Box
              p="m"
              sx={{
                background: getToken("surfaces.containers.dim.dimOnBg"),
                borderRadius: "containersPrimary",
              }}
            >
              <Flex align="center" justify="space-between" gap="m">
                <Flex align="center" gap="s">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "9999px",
                      background: getToken("surfaces.containers.mid.primary"),
                    }}
                  />
                  <Stack direction="column" gap="3xs">
                    <Text fs="p5" fw={500}>
                      Account
                    </Text>
                    <Text fs="p6" color={getToken("text.medium")}>
                      7Jw…NHr6Sp5
                    </Text>
                  </Stack>
                </Flex>
                <Button size="small" variant="secondary" outline>
                  Switch
                </Button>
              </Flex>
            </Box>
          </Stack>

          <ModalContentDivider />

          <ToggleGroup
            type="single"
            value={voteType}
            onValueChange={(v) => v && setVoteType(v as VoteType)}
            size="medium"
          >
            <ToggleGroupItem value="aye">Aye</ToggleGroupItem>
            <ToggleGroupItem value="nay">Nay</ToggleGroupItem>
            <ToggleGroupItem value="split">Split</ToggleGroupItem>
            <ToggleGroupItem value="abstain">Abstain</ToggleGroupItem>
          </ToggleGroup>

          <ModalContentDivider />

          {voteType === "aye" && <VoteValueField label="Aye Vote Value" />}
          {voteType === "nay" && <VoteValueField label="Nay Vote Value" />}
          {voteType === "split" && (
            <Stack direction="column" gap="m">
              <VoteValueField label="Aye Vote Value" />
              <VoteValueField label="Nay Vote Value" />
            </Stack>
          )}
          {voteType === "abstain" && (
            <Stack direction="column" gap="m">
              <VoteValueField label="Abstain Vote Value" />
              <VoteValueField label="Aye Vote Value" />
              <VoteValueField label="Nay Vote Value" />
            </Stack>
          )}

          {showMultiplierAndSummary && (
            <>
              <ModalContentDivider />

              <Stack direction="column" gap="s">
                <Text fs="p5" fw={500}>
                  Voting Power Multiplier
                </Text>
                <Flex justify="space-between">
                  {MULTIPLIER_LABELS.map((label) => (
                    <Text key={label} fs="p6" color={getToken("text.medium")}>
                      {label}
                    </Text>
                  ))}
                </Flex>
                <Box
                  sx={{
                    '& [role="slider"]': {
                      width: 20,
                      height: 22,
                      borderRadius: 8,
                      background: getToken("buttons.primary.high.rest"),
                    },
                    "& div[data-orientation]": {
                      background: getToken("buttons.primary.high.rest"),
                    },
                  }}
                >
                  <Slider
                    value={multiplier}
                    onChange={setMultiplier}
                    min={0}
                    max={6}
                    step={1}
                  />
                </Box>
              </Stack>

              <ModalContentDivider />

              <Box
                p="m"
                sx={{
                  background: getToken("surfaces.containers.dim.dimOnBg"),
                  borderRadius: "containersPrimary",
                }}
              >
                <Stack direction="column" gap="s">
                  <Flex justify="space-between" align="center">
                    <Text fs="p5" color={getToken("text.medium")}>
                      Total Votes
                    </Text>
                    <Text fs="p5" fw={500}>
                      0 HDX
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fs="p5" color={getToken("text.medium")}>
                      Lock Duration
                    </Text>
                    <Text fs="p5" fw={500}>
                      {lockDays === 0 ? "0 d" : `≈ ${lockDays} d`}
                    </Text>
                  </Flex>
                  <Text fs="p6" color={getToken("text.medium")} lh="s">
                    Your HDX will stay locked for the entire voting period.
                    After the vote ends, it remains locked for an additional
                    period based on your selected multiplier.
                  </Text>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </ModalBody>
      <Separator />
      <ModalFooter>
        <Button
          size="large"
          width="100%"
          onClick={() => {
            // TODO: submit vote
          }}
        >
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  )
}
