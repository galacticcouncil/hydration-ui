import {
  AccountTile,
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
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useAccountBalance } from "@/states/account"
import { NATIVE_ASSET_DECIMALS, NATIVE_ASSET_ID } from "@/utils/consts"
import { toDecimal } from "@/utils/formatting"

type Props = {
  referendumId: number
  open: boolean
  onClose: () => void
}

type VoteType = "aye" | "nay" | "split" | "abstain"

const MULTIPLIER_LABELS = ["0x", "1x", "2x", "3x", "4x", "5x", "6x"]

const LOCK_DURATION_DAYS = [0, 7, 14, 27, 56, 112, 224]

const VoteValueField: FC<{
  label: string
  value: string
  onChange: (v: string) => void
}> = ({ label, value, onChange }) => (
  <Stack direction="column" gap="s">
    <Text fs="p5" fw={500}>
      {label}
    </Text>
    <Input
      value={value}
      unit="HDX"
      placeholder="0"
      inputMode="decimal"
      autoComplete="off"
      onChange={(e) => {
        const raw = e.target.value.replace(/\s+/g, "").replace(/,/g, ".")
        if (raw === "" || !isNaN(Number(raw))) {
          onChange(raw)
        }
      }}
    />
  </Stack>
)

export const VoteModal: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const hdxBalance = useAccountBalance(NATIVE_ASSET_ID)
  const humanHdx = toDecimal(hdxBalance?.total ?? "0", NATIVE_ASSET_DECIMALS)
  const formattedHdx = t("currency", { value: humanHdx, symbol: "HDX" })

  const [voteType, setVoteType] = useState<VoteType>("aye")
  const [multiplier, setMultiplier] = useState(0)
  const [ayeValue, setAyeValue] = useState("")
  const [nayValue, setNayValue] = useState("")
  const [abstainValue, setAbstainValue] = useState("")
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
                  {formattedHdx}
                </Text>
              </Flex>
            </Flex>

            <AccountTile
              name={account?.name ?? ""}
              address={account?.address ?? ""}
            />
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

          {voteType === "aye" && (
            <VoteValueField
              label="Aye Vote Value"
              value={ayeValue}
              onChange={setAyeValue}
            />
          )}
          {voteType === "nay" && (
            <VoteValueField
              label="Nay Vote Value"
              value={nayValue}
              onChange={setNayValue}
            />
          )}
          {voteType === "split" && (
            <Stack direction="column" gap="m">
              <VoteValueField
                label="Aye Vote Value"
                value={ayeValue}
                onChange={setAyeValue}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
              />
            </Stack>
          )}
          {voteType === "abstain" && (
            <Stack direction="column" gap="m">
              <VoteValueField
                label="Abstain Vote Value"
                value={abstainValue}
                onChange={setAbstainValue}
              />
              <VoteValueField
                label="Aye Vote Value"
                value={ayeValue}
                onChange={setAyeValue}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
              />
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
