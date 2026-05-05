import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  AccountAvatar,
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
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_DECIMALS, NATIVE_ASSET_ID } from "@/utils/consts"
import { toBigInt, toDecimal } from "@/utils/formatting"

type Props = {
  referendumId: number
  open: boolean
  onClose: () => void
}

type VoteType = "aye" | "nay" | "split" | "abstain"

const MULTIPLIER_LABELS = ["0.1x", "1x", "2x", "3x", "4x", "5x", "6x"]
const CONVICTION_WEIGHTS = [0.1, 1, 2, 3, 4, 5, 6]
const LOCK_DURATION_DAYS = [0, 7, 14, 27, 56, 112, 224]
const DEFAULT_MULTIPLIER = 1

const TOOLTIP_VOTE_VALUE =
  "The amount to back your vote with. The chain locks GIGAHDX first; HDX is only used after GIGAHDX is fully spent."
const TOOLTIP_MULTIPLIER =
  "Conviction multiplier — increases your vote weight in exchange for locking your tokens longer after the vote concludes. 0.1x means no lock but the vote only counts at 10% weight."

const formatIntegerWithSpaces = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

const formatDecimalWithSpaces = (value: string): string => {
  const [intPart, fracPart] = value.split(".")
  const formatted = formatIntegerWithSpaces(intPart ?? "")
  return fracPart !== undefined ? `${formatted}.${fracPart}` : formatted
}

const VoteValueField: FC<{
  label?: string
  tooltip?: string
  value: string
  onChange: (v: string) => void
  unit?: string
  maxValue?: string
  disabled?: boolean
}> = ({
  label,
  tooltip,
  value,
  onChange,
  unit = "HDX",
  maxValue,
  disabled,
}) => (
  <Stack direction="column" gap="s">
    {label && (
      <Flex align="center" gap="xs">
        <Text fs="p5" fw={500}>
          {label}
        </Text>
        {tooltip && <Tooltip text={tooltip} />}
      </Flex>
    )}
    <Flex align="center" gap="s">
      <Box sx={{ flex: 1 }}>
        <Input
          value={formatDecimalWithSpaces(value)}
          unit={unit}
          placeholder="0"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value.replace(/\s+/g, "").replace(",", ".")
            if (/^\d*\.?\d*$/.test(raw)) {
              onChange(raw)
            }
          }}
        />
      </Box>
      {maxValue !== undefined && (
        <Button
          size="small"
          variant="secondary"
          outline
          disabled={disabled}
          sx={{
            "&:hover, &:focus": {
              color: `${getToken("buttons.primary.high.rest")} !important`,
            },
          }}
          onClick={(e) => {
            onChange(maxValue)
            e.currentTarget.blur()
          }}
        >
          MAX
        </Button>
      )}
    </Flex>
  </Stack>
)

export const VoteModal: FC<Props> = ({ referendumId, open, onClose }) => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const hdxBalance = useAccountBalance(NATIVE_ASSET_ID)
  const rawHdx = hdxBalance?.total?.toString() ?? "0"
  const humanHdx = toDecimal(rawHdx, NATIVE_ASSET_DECIMALS)
  const formattedHdx = t("currency", { value: humanHdx, symbol: "HDX" })

  const gigaHdxAsset = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const gigaHdxBalance = useAccountBalance(HDX_ERC20_ASSET_ID)
  const rawGigaHdx = gigaHdxBalance?.total?.toString() ?? "0"
  const humanGigaHdx = toDecimal(rawGigaHdx, gigaHdxAsset.decimals)
  const formattedGigaHdx = t("currency", {
    value: humanGigaHdx,
    symbol: gigaHdxAsset.symbol,
  })

  const [voteType, setVoteType] = useState<VoteType>("aye")
  const [multiplier, setMultiplier] = useState(DEFAULT_MULTIPLIER)
  const [ayeGigaValue, setAyeGigaValue] = useState("")
  const [ayeValue, setAyeValue] = useState("")
  const [nayGigaValue, setNayGigaValue] = useState("")
  const [nayValue, setNayValue] = useState("")
  const [abstainValue, setAbstainValue] = useState("")

  const showMultiplierAndSummary = voteType === "aye" || voteType === "nay"
  const lockDays = LOCK_DURATION_DAYS[multiplier] ?? 0
  const convictionWeight = CONVICTION_WEIGHTS[multiplier] ?? 1

  const gigaAtomic = (v: string) => toBigInt(v || "0", gigaHdxAsset.decimals)
  const hdxAtomic = (v: string) => toBigInt(v || "0", NATIVE_ASSET_DECIMALS)

  const hasGigaHdx = rawGigaHdx !== "0"
  const ayeGigaIsMaxed = hasGigaHdx && ayeGigaValue === humanGigaHdx
  const nayGigaIsMaxed = hasGigaHdx && nayGigaValue === humanGigaHdx
  const ayeGigaDisabled = !hasGigaHdx
  const ayeHdxDisabled = hasGigaHdx && !ayeGigaIsMaxed
  const nayGigaDisabled = !hasGigaHdx
  const nayHdxDisabled = hasGigaHdx && !nayGigaIsMaxed

  const handleAyeGigaChange = (v: string) => {
    setAyeGigaValue(v)
    if (v !== humanGigaHdx) setAyeValue("")
  }
  const handleNayGigaChange = (v: string) => {
    setNayGigaValue(v)
    if (v !== humanGigaHdx) setNayValue("")
  }

  const buildAccountVote = () => {
    if (voteType === "aye" || voteType === "nay") {
      const isAye = voteType === "aye"
      const giga = voteType === "aye" ? ayeGigaValue : nayGigaValue
      const hdx = voteType === "aye" ? ayeValue : nayValue
      const balance = gigaAtomic(giga) + hdxAtomic(hdx)
      return {
        type: "Standard" as const,
        value: {
          vote: (isAye ? 0x80 : 0x00) | (multiplier & 0x7f),
          balance,
        },
      }
    }
    if (voteType === "split") {
      return {
        type: "Split" as const,
        value: {
          aye: hdxAtomic(ayeValue),
          nay: hdxAtomic(nayValue),
        },
      }
    }
    return {
      type: "SplitAbstain" as const,
      value: {
        aye: hdxAtomic(ayeValue),
        nay: hdxAtomic(nayValue),
        abstain: hdxAtomic(abstainValue),
      },
    }
  }

  const handleSubmit = () => {
    const tx = papi.tx.ConvictionVoting.vote({
      poll_index: referendumId,
      vote: buildAccountVote(),
    })

    createTransaction(
      {
        tx,
        invalidateQueries: [["accountOpenGovVotes"], ["openGovReferenda"]],
      },
      { onSubmitted: onClose },
    ).catch(() => {})
  }

  const isSubmitDisabled = (() => {
    if (voteType === "aye" || voteType === "nay") {
      const giga = voteType === "aye" ? ayeGigaValue : nayGigaValue
      const hdx = voteType === "aye" ? ayeValue : nayValue
      return gigaAtomic(giga) + hdxAtomic(hdx) === 0n
    }
    if (voteType === "split") {
      return hdxAtomic(ayeValue) === 0n && hdxAtomic(nayValue) === 0n
    }
    return (
      hdxAtomic(ayeValue) === 0n &&
      hdxAtomic(nayValue) === 0n &&
      hdxAtomic(abstainValue) === 0n
    )
  })()

  const totalVoteAtomic =
    voteType === "aye"
      ? gigaAtomic(ayeGigaValue) + hdxAtomic(ayeValue)
      : voteType === "nay"
        ? gigaAtomic(nayGigaValue) + hdxAtomic(nayValue)
        : 0n
  const totalVoteHuman = toDecimal(
    totalVoteAtomic.toString(),
    NATIVE_ASSET_DECIMALS,
  )
  const totalVotesHuman = totalVoteAtomic
    ? Big(totalVoteHuman).times(convictionWeight).toString()
    : "0"

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <ModalHeader title="Referendum vote" />
      <ModalBody>
        <Stack direction="column" gap="l">
          <Stack direction="column" gap="m">
            <Text fs="p5" fw={500}>
              Origin
            </Text>

            <Box
              p="m"
              sx={{
                background: getToken("controls.dim.base"),
                borderRadius: "m",
              }}
            >
              <Flex align="center" justify="space-between" gap="m">
                <Flex align="center" gap="s">
                  <AccountAvatar address={account?.address ?? ""} />
                  <Stack direction="column" gap="3xs">
                    <Text fs="p3" fw={500} color={getToken("text.high")}>
                      {account?.name ?? ""}
                    </Text>
                    <Text fs="p5" color={getToken("text.medium")}>
                      {account?.address
                        ? shortenAccountAddress(account.address)
                        : ""}
                    </Text>
                  </Stack>
                </Flex>
                <Stack direction="column" gap="3xs" align="end">
                  <Text fs="p6" color={getToken("text.medium")}>
                    Voting Balance:
                  </Text>
                  <Text fs="p5" fw={500}>
                    {formattedHdx}
                  </Text>
                  <Text fs="p5" fw={500}>
                    {formattedGigaHdx}
                  </Text>
                </Stack>
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

          {voteType === "aye" && (
            <Stack direction="column" gap="s">
              <Flex align="center" gap="xs">
                <Text fs="p5" fw={500}>
                  Aye Vote Value
                </Text>
                <Tooltip text={TOOLTIP_VOTE_VALUE} />
              </Flex>
              <VoteValueField
                value={ayeGigaValue}
                onChange={handleAyeGigaChange}
                unit={gigaHdxAsset.symbol}
                maxValue={humanGigaHdx}
                disabled={ayeGigaDisabled}
              />
              <VoteValueField
                value={ayeValue}
                onChange={setAyeValue}
                maxValue={humanHdx}
                disabled={ayeHdxDisabled}
              />
            </Stack>
          )}
          {voteType === "nay" && (
            <Stack direction="column" gap="s">
              <Flex align="center" gap="xs">
                <Text fs="p5" fw={500}>
                  Nay Vote Value
                </Text>
                <Tooltip text={TOOLTIP_VOTE_VALUE} />
              </Flex>
              <VoteValueField
                value={nayGigaValue}
                onChange={handleNayGigaChange}
                unit={gigaHdxAsset.symbol}
                maxValue={humanGigaHdx}
                disabled={nayGigaDisabled}
              />
              <VoteValueField
                value={nayValue}
                onChange={setNayValue}
                maxValue={humanHdx}
                disabled={nayHdxDisabled}
              />
            </Stack>
          )}
          {voteType === "split" && (
            <Stack direction="column" gap="m">
              <VoteValueField
                label="Aye Vote Value"
                value={ayeValue}
                onChange={setAyeValue}
                maxValue={humanHdx}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
                maxValue={humanHdx}
              />
            </Stack>
          )}
          {voteType === "abstain" && (
            <Stack direction="column" gap="m">
              <VoteValueField
                label="Abstain Vote Value"
                value={abstainValue}
                onChange={setAbstainValue}
                maxValue={humanHdx}
              />
              <VoteValueField
                label="Aye Vote Value"
                value={ayeValue}
                onChange={setAyeValue}
                maxValue={humanHdx}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
                maxValue={humanHdx}
              />
            </Stack>
          )}

          {showMultiplierAndSummary && (
            <>
              <ModalContentDivider />

              <Stack direction="column" gap="s">
                <Flex align="center" gap="xs">
                  <Text fs="p5" fw={500}>
                    Voting Power Multiplier
                  </Text>
                  <Tooltip text={TOOLTIP_MULTIPLIER} />
                </Flex>
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
                      {t("currency", {
                        value: totalVotesHuman,
                        symbol: "HDX",
                      })}
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
                    Your HDX/GIGAHDX will stay locked for the entire voting
                    period. After the vote ends, it remains locked for an
                    additional period based on your selected multiplier.
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
          disabled={!account?.address || isSubmitDisabled}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  )
}
