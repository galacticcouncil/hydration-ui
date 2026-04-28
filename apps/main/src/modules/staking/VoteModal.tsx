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
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
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

const formatWithSpaces = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

const VoteValueField: FC<{
  label?: string
  value: string
  onChange: (v: string) => void
  unit?: string
  maxValue?: string
  disabled?: boolean
}> = ({ label, value, onChange, unit = "HDX", maxValue, disabled }) => (
  <Stack direction="column" gap="s">
    {label && (
      <Text fs="p5" fw={500}>
        {label}
      </Text>
    )}
    <Flex align="center" gap="s">
      <Box sx={{ flex: 1 }}>
        <Input
          value={formatWithSpaces(value)}
          unit={unit}
          placeholder="0"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value.replace(/\s+/g, "")
            if (/^\d*$/.test(raw)) {
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
  const { papi, dataEnv } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const hdxBalance = useAccountBalance(NATIVE_ASSET_ID)
  const rawHdx = hdxBalance?.total?.toString() ?? "0"
  const formattedHdx = t("currency", {
    value: toDecimal(rawHdx, NATIVE_ASSET_DECIMALS),
    symbol: "HDX",
  })

  const gigaHdxAsset = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const gigaHdxBalance = useAccountBalance(HDX_ERC20_ASSET_ID)
  const rawGigaHdx = gigaHdxBalance?.total?.toString() ?? "0"
  const formattedGigaHdx = t("currency", {
    value: toDecimal(rawGigaHdx, gigaHdxAsset.decimals),
    symbol: gigaHdxAsset.symbol,
  })

  const [voteType, setVoteType] = useState<VoteType>("aye")
  const [multiplier, setMultiplier] = useState(0)
  const [ayeGigaValue, setAyeGigaValue] = useState("")
  const [ayeValue, setAyeValue] = useState("")
  const [nayGigaValue, setNayGigaValue] = useState("")
  const [nayValue, setNayValue] = useState("")
  const [abstainValue, setAbstainValue] = useState("")
  const lockDays = LOCK_DURATION_DAYS[multiplier] ?? 0

  const showMultiplierAndSummary = voteType === "aye" || voteType === "nay"

  const hasGigaHdx = rawGigaHdx !== "0"
  const ayeGigaIsMaxed = hasGigaHdx && ayeGigaValue === rawGigaHdx
  const nayGigaIsMaxed = hasGigaHdx && nayGigaValue === rawGigaHdx
  const ayeGigaDisabled = !hasGigaHdx
  const ayeHdxDisabled = hasGigaHdx && !ayeGigaIsMaxed
  const nayGigaDisabled = !hasGigaHdx
  const nayHdxDisabled = hasGigaHdx && !nayGigaIsMaxed

  const handleAyeGigaChange = (v: string) => {
    setAyeGigaValue(v)
    if (v !== rawGigaHdx) setAyeValue("")
  }
  const handleNayGigaChange = (v: string) => {
    setNayGigaValue(v)
    if (v !== rawGigaHdx) setNayValue("")
  }

  const buildAccountVote = () => {
    if (voteType === "aye" || voteType === "nay") {
      const isAye = voteType === "aye"
      const giga = voteType === "aye" ? ayeGigaValue : nayGigaValue
      const hdx = voteType === "aye" ? ayeValue : nayValue
      const balance = BigInt(giga || "0") + BigInt(hdx || "0")
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
          aye: BigInt(ayeValue || "0"),
          nay: BigInt(nayValue || "0"),
        },
      }
    }
    return {
      type: "SplitAbstain" as const,
      value: {
        aye: BigInt(ayeValue || "0"),
        nay: BigInt(nayValue || "0"),
        abstain: BigInt(abstainValue || "0"),
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
        invalidateQueries: [
          ["accountOpenGovVotes", account?.address ?? ""],
          ["openGovReferenda", dataEnv],
        ],
      },
      { onSubmitted: onClose },
    ).catch(() => {})
  }

  const isSubmitDisabled = (() => {
    if (voteType === "aye" || voteType === "nay") {
      const giga = voteType === "aye" ? ayeGigaValue : nayGigaValue
      const hdx = voteType === "aye" ? ayeValue : nayValue
      return BigInt(giga || "0") + BigInt(hdx || "0") === 0n
    }
    if (voteType === "split") {
      return BigInt(ayeValue || "0") === 0n && BigInt(nayValue || "0") === 0n
    }
    return (
      BigInt(ayeValue || "0") === 0n &&
      BigInt(nayValue || "0") === 0n &&
      BigInt(abstainValue || "0") === 0n
    )
  })()

  const totalVoteValue =
    voteType === "aye"
      ? BigInt(ayeGigaValue || "0") + BigInt(ayeValue || "0")
      : voteType === "nay"
        ? BigInt(nayGigaValue || "0") + BigInt(nayValue || "0")
        : 0n

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
              <Text fs="p5" fw={500}>
                Aye Vote Value
              </Text>
              <VoteValueField
                value={ayeGigaValue}
                onChange={handleAyeGigaChange}
                unit={gigaHdxAsset.symbol}
                maxValue={rawGigaHdx}
                disabled={ayeGigaDisabled}
              />
              <VoteValueField
                value={ayeValue}
                onChange={setAyeValue}
                maxValue={rawHdx}
                disabled={ayeHdxDisabled}
              />
            </Stack>
          )}
          {voteType === "nay" && (
            <Stack direction="column" gap="s">
              <Text fs="p5" fw={500}>
                Nay Vote Value
              </Text>
              <VoteValueField
                value={nayGigaValue}
                onChange={handleNayGigaChange}
                unit={gigaHdxAsset.symbol}
                maxValue={rawGigaHdx}
                disabled={nayGigaDisabled}
              />
              <VoteValueField
                value={nayValue}
                onChange={setNayValue}
                maxValue={rawHdx}
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
                maxValue={rawHdx}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
                maxValue={rawHdx}
              />
            </Stack>
          )}
          {voteType === "abstain" && (
            <Stack direction="column" gap="m">
              <VoteValueField
                label="Abstain Vote Value"
                value={abstainValue}
                onChange={setAbstainValue}
                maxValue={rawHdx}
              />
              <VoteValueField
                label="Aye Vote Value"
                value={ayeValue}
                onChange={setAyeValue}
                maxValue={rawHdx}
              />
              <VoteValueField
                label="Nay Vote Value"
                value={nayValue}
                onChange={setNayValue}
                maxValue={rawHdx}
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
                      Total Vote Value
                    </Text>
                    <Text fs="p5" fw={500}>
                      {formatWithSpaces(totalVoteValue.toString())}{" "}
                      (GIGAHDX+HDX)
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
          disabled={!account?.address || isSubmitDisabled}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  )
}
