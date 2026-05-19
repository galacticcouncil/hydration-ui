import { Check } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
  Chip,
  Flex,
  Icon,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  convictionVoteMultiplierForDisplay,
  convictionVoteWeightFactor,
  TAccountVote,
} from "@/api/democracy"
import { useAssets } from "@/providers/assetsProvider"
import { toDecimal } from "@/utils/formatting"

import { ReferendaRewardBadge } from "./ReferendaRewardBadge"

type Props = {
  readonly trackId: number
  readonly trackName: string
  readonly state: string
  readonly id: number
  readonly vote: TAccountVote | undefined
}

export const ReferendaHeader: FC<Props> = ({
  trackId,
  trackName,
  state,
  id,
  vote,
}) => {
  const { native } = useAssets()
  const { t } = useTranslation(["staking", "common"])

  const trackFormatted = trackName.replaceAll("_", " ")
  const isStandardVote = vote?.voteKind === "aye" || vote?.voteKind === "nay"

  if (vote) {
    const capitalHuman = toDecimal(vote.balance, native.decimals)

    const yourVotesHuman = isStandardVote
      ? Big(capitalHuman)
          .times(convictionVoteWeightFactor(vote.conviction))
          .toString()
      : capitalHuman

    const convictionDisplay = isStandardVote
      ? convictionVoteMultiplierForDisplay(vote.conviction)
      : t("staking:referenda.item.convictionVarious")

    const yourVotesDisplay = `${t("common:approx.short")} ${t(
      "common:currency",
      {
        value: yourVotesHuman,
        symbol: native.symbol,
      },
    )}`

    const capitalDisplay = `${t("common:approx.short")} ${t("common:currency", {
      value: capitalHuman,
      symbol: native.symbol,
    })}`

    return (
      <Box bg={getToken("surfaces.containers.dim.dimOnHigh")}>
        <ReferendaRewardBadge id={id} trackId={trackId} />
        <Flex align="center" justify="space-between" py="m" px="l">
          <Flex align="center" gap="s">
            {trackFormatted && (
              <Chip
                sx={{ textTransform: "uppercase" }}
                rounded
                variant="tertiary"
              >
                {trackFormatted}
              </Chip>
            )}
            <Text
              font="primary"
              fs="p3"
              fw={500}
              lh={1.3}
              color={getToken("text.tint.primary")}
            >
              #{id}
            </Text>
          </Flex>

          <Chip sx={{ textTransform: "uppercase" }} rounded variant="green">
            <Flex align="center" gap="s">
              <Icon size="xs" component={Check} />
              <Text as="span" fs="p6" lh={1}>
                <Text as="span" fw={500}>
                  {t("staking:referenda.item.votedWith")}
                </Text>
                <Text as="span" fw={700}>
                  {t(`staking:referenda.item.${vote.voteKind}`)}
                </Text>
              </Text>
            </Flex>
          </Chip>
        </Flex>
        <Separator orientation="horizontal" />
        <Stack
          direction="row"
          gap="s"
          justify="space-between"
          py={["l", "l"]}
          px={["m", "xl"]}
          separated
        >
          <Amount
            label={t("staking:referenda.item.yourVotes")}
            value={yourVotesDisplay}
          />

          <Amount
            label={t("staking:referenda.item.convictionLabel")}
            value={convictionDisplay}
          />

          <Amount
            label={t("staking:referenda.item.capital")}
            value={capitalDisplay}
          />
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      <ReferendaRewardBadge id={id} trackId={trackId} />
      <Flex align="center" justify="space-between" py="m" px="l">
        <Flex align="center" gap="s" wrap>
          {trackFormatted && (
            <Chip
              sx={{ textTransform: "uppercase" }}
              rounded
              variant="tertiary"
            >
              {trackFormatted}
            </Chip>
          )}
          <Chip sx={{ textTransform: "uppercase" }} rounded variant="green">
            {state}
          </Chip>
        </Flex>

        <Text
          font="primary"
          fs="p3"
          fw={500}
          lh={1.3}
          color={getToken("text.medium")}
        >
          #{id}
        </Text>
      </Flex>
    </Box>
  )
}
