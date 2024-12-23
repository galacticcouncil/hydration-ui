import { TReferenda, useReferendumInfo } from "api/democracy"
import VoteIcon from "assets/icons/StakingVote.svg?react"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { BN_0 } from "utils/constants"
import {
  SHeader,
  SOpenGovContainer,
  SProgressBarContainer,
  SThresholdLine,
  STrackBadge,
  SVoteButton,
} from "./ReferendumCard.styled"
import { Icon } from "components/Icon/Icon"
import { LinearProgress } from "components/Progress"
import { theme } from "theme"
import { PalletReferendaReferendumStatus } from "@polkadot/types/lookup"
import { useAssets } from "providers/assets"
import {
  getPerbillPercentage,
  useMinApprovalThreshold,
  useReferendaVotes,
  useSupportThreshold,
} from "./Referenda.utils"
import Skeleton from "react-loading-skeleton"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"

export const OpenGovReferenda = ({
  id,
  referenda,
  track,
  totalIssuance,
}: {
  id: string
  referenda: PalletReferendaReferendumStatus
  track: TReferenda
  totalIssuance?: string
}) => {
  const { native } = useAssets()
  const { t } = useTranslation()

  const { data: subscanInfo, isLoading } = useReferendumInfo(id)

  const minApprovalThreshold = useMinApprovalThreshold(track, referenda)
  const { threshold, maxSupportBarValue, barPercentage, markPercentage } =
    useSupportThreshold(track, referenda, totalIssuance ?? "0")
  const votes = useReferendaVotes(referenda)

  const isNoVotes = votes.percAyes.eq(0) && votes.percNays.eq(0)
  const isOneWayVote = votes.percAyes.eq(0) || votes.percNays.eq(0)

  return (
    <SOpenGovContainer type="staking">
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          {track && <TrackBadge title={track.nameHuman} />}
          <StateBadge referenda={referenda} />
          <Text css={{ color: "#DFB1F3" }} fs={14} fw={500}>
            #{id}
          </Text>
        </div>
      </SHeader>

      <Separator css={{ background: "#372244" }} sx={{ my: 16 }} />

      <div sx={{ px: 16 }}>
        {isLoading ? (
          <Skeleton height={23} width="100%" />
        ) : (
          <Text fs={18} css={{ color: "#DFB1F3" }} fw={500}>
            {subscanInfo?.title ?? "N/a"}
          </Text>
        )}

        <Spacer size={20} />

        <div sx={{ flex: "column", gap: 8 }}>
          <SProgressBarContainer>
            <div
              sx={{ flex: "row", gap: isOneWayVote ? 0 : 6 }}
              css={{ position: "relative" }}
            >
              {isNoVotes ? (
                <LinearProgress
                  size="small"
                  withoutLabel
                  percent={0}
                  colorCustom={`rgba(${theme.rgbColors.darkBlue300}, 0.5)`}
                />
              ) : (
                <>
                  <LinearProgress
                    css={{ width: `${votes.percAyes.toNumber()}%` }}
                    size="small"
                    withoutLabel
                    percent={100}
                    colorCustom="#6FC272"
                  />
                  <LinearProgress
                    css={{ width: `${votes.percNays.toNumber()}%` }}
                    size="small"
                    withoutLabel
                    percent={100}
                    colorCustom="#FF5757"
                  />
                </>
              )}
              <SThresholdLine
                percentage={minApprovalThreshold?.toString() ?? "0"}
              />
            </div>
          </SProgressBarContainer>
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "column", gap: 2 }}>
              <Text fs={13} lh={13} color="white" font="GeistMedium">
                {t("toast.sidebar.referendums.aye")}
              </Text>
              <div sx={{ flex: "row", gap: 2 }}>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {t("value.compact", {
                    value: votes.ayes,
                    numberSuffix: "HDX",
                  })}
                </Text>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {native.symbol}
                </Text>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {t("value.percentage", {
                    value: votes.percAyes,
                    numberPrefix: "(",
                    numberSuffix: "%)",
                  })}
                </Text>
              </div>
            </div>
            <div sx={{ flex: "column", gap: 2, align: "center" }}>
              <Text fs={13} lh={13} color="white" font="GeistMedium">
                {t("threshold")}
              </Text>
              <Text fs={11} css={{ color: "#DFB1F3" }}>
                {t("value.percentage", { value: minApprovalThreshold })}
              </Text>
            </div>
            <div sx={{ flex: "column", gap: 2, align: "end" }}>
              <Text fs={13} lh={13} color="white" font="GeistMedium">
                {t("toast.sidebar.referendums.nay")}
              </Text>
              <div sx={{ flex: "row", gap: 2 }}>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {t("value.compact", { value: votes.nays })}
                </Text>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {native.symbol}
                </Text>
                <Text fs={11} css={{ color: "#DFB1F3" }}>
                  {t("value.percentage", {
                    value: votes.percNays,
                    numberPrefix: "(",
                    numberSuffix: "%)",
                  })}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <Spacer size={16} />
        <div sx={{ flex: "column", gap: 8 }}>
          <InfoTooltip
            text={t("referenda.support", {
              value: t("value.percentage", { value: barPercentage }),
            })}
            align="center"
          >
            <SProgressBarContainer>
              <div css={{ position: "relative" }}>
                <LinearProgress
                  size="small"
                  withoutLabel
                  percent={barPercentage}
                  colorCustom="#B3D7FA"
                />
                <SThresholdLine percentage={markPercentage.toString()} />
              </div>
            </SProgressBarContainer>
          </InfoTooltip>
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "row", gap: 2 }}>
              <Text fs={11} css={{ color: "#DFB1F3" }}>
                {t("value.percentage", { value: BN_0 })}
              </Text>
            </div>

            <div sx={{ flex: "column", gap: 2, align: "center" }}>
              <Text fs={13} lh={13} color="white" font="GeistMedium">
                {t("threshold")}
              </Text>
              <Text fs={11} css={{ color: "#DFB1F3" }}>
                {getPerbillPercentage(threshold?.toNumber())}
              </Text>
            </div>

            <div sx={{ flex: "row", gap: 2 }}>
              <Text fs={11} css={{ color: "#DFB1F3" }}>
                {getPerbillPercentage(maxSupportBarValue)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <Separator css={{ background: "#372244" }} sx={{ my: 16 }} />

      <div sx={{ flex: "row", gap: 48, justify: "space-between", px: 16 }}>
        <SVoteButton
          disabled={isLoading}
          target="_blank"
          href={`https://hydration.subsquare.io/referenda/${id}`}
          rel="noreferrer"
        >
          <Icon icon={<VoteIcon />} />
          {t("referenda.btn.vote")}
        </SVoteButton>
      </div>
    </SOpenGovContainer>
  )
}

const TrackBadge = ({ title }: { title: string }) => {
  return <STrackBadge>{title}</STrackBadge>
}

const StateBadge = ({
  referenda,
}: {
  referenda: PalletReferendaReferendumStatus
}) => {
  const { t } = useTranslation()
  let state

  const decisionDeposit = referenda.decisionDeposit.toString()
  const deciding = referenda.deciding.unwrapOr(null)

  if (!decisionDeposit || !deciding) {
    state = t("referenda.state.preparing")
  } else if (!deciding.confirming.toString()) {
    state = t("referenda.state.deciding")
  } else {
    state = t("referenda.state.confirming")
  }

  return (
    <STrackBadge
      css={{ background: "rgba(0, 238, 149, 0.10)", color: "#71F8C5" }}
    >
      {state}
    </STrackBadge>
  )
}
