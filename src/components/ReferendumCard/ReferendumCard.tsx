import { PalletDemocracyReferendumInfo } from "@polkadot/types/lookup"
import { useReferendumInfo } from "api/democracy"
import IconArrow from "assets/icons/IconArrow.svg?react"
import GovernanceIcon from "assets/icons/GovernanceIcon.svg?react"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { BN_0, BN_10, PARACHAIN_BLOCK_TIME } from "utils/constants"
import { SContainer, SHeader, SVotedBage } from "./ReferendumCard.styled"
import { ReferendumCardSkeleton } from "./ReferendumCardSkeleton"
import { Icon } from "components/Icon/Icon"
import BN from "bignumber.js"
import { useBestNumber } from "api/chain"
import { customFormatDuration } from "utils/formatting"
import { LinearProgress } from "components/Progress"
import { theme } from "theme"

const REFERENDUM_LINK = import.meta.env.VITE_REFERENDUM_LINK as string

type Props = {
  id: string
  referendum: PalletDemocracyReferendumInfo
  type: "toast" | "staking"
  voted: boolean
}

export const ReferendumCard = ({ id, referendum, type, voted }: Props) => {
  const { t } = useTranslation()

  const info = useReferendumInfo(id)
  const bestNumber = useBestNumber()

  const votes = useMemo(() => {
    if (!referendum.isOngoing)
      return { ayes: BN_0, nays: BN_0, percAyes: BN_0, percNays: BN_0 }

    const ayes = referendum.asOngoing.tally.ayes
      .toBigNumber()
      .div(BN_10.pow(12))
    const nays = referendum.asOngoing.tally.nays
      .toBigNumber()
      .div(BN_10.pow(12))

    const votesSum = ayes.plus(nays)

    let percAyes = BN_0
    let percNays = BN_0

    if (!votesSum.isZero()) {
      percAyes = ayes.div(votesSum).times(100)
      percNays = nays.div(votesSum).times(100)
    }

    return { ayes, nays, percAyes, percNays }
  }, [referendum])

  const isNoVotes = votes.percAyes.eq(0) && votes.percNays.eq(0)
  const diff = BN(info?.data?.onchainData.meta.end ?? 0)
    .minus(bestNumber.data?.parachainBlockNumber.toBigNumber() ?? 0)
    .times(PARACHAIN_BLOCK_TIME)
    .toNumber()
  const endDate = customFormatDuration({ end: diff * 1000 })

  return info.isLoading || !info.data ? (
    <ReferendumCardSkeleton type={type} />
  ) : (
    <SContainer
      type={type}
      href={`${REFERENDUM_LINK}/${info.data.referendumIndex}`}
      target="_blank"
      rel="noreferrer"
    >
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text color="brightBlue200" fs={14} fw={500}>
            #{info.data.referendumIndex}
          </Text>
          <Text color="brightBlue200" fs={12} fw={500}>
            {"//"}
          </Text>
          <Text color="basic500" fs={13} fw={500}>
            {endDate &&
              t(`duration.${endDate.isPositive ? "left" : "ago"}`, {
                duration: endDate.duration,
              })}
          </Text>
        </div>

        <div sx={{ flex: "row", gap: 20, align: "center" }}>
          {voted && (
            <SVotedBage>
              {t("toast.sidebar.referendums.voted")}
              <Icon
                size={11}
                sx={{ color: "basic900" }}
                icon={<GovernanceIcon />}
              />
            </SVotedBage>
          )}
          <Icon sx={{ color: "brightBlue300" }} icon={<IconArrow />} />
        </div>
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Text color="white" fw={500}>
        {info.data.title}
      </Text>

      <Spacer size={20} />

      <div sx={{ flex: "row", gap: 8 }}>
        {isNoVotes ? (
          <LinearProgress
            size="small"
            withoutLabel
            percent={100}
            colorCustom={`rgba(${theme.rgbColors.darkBlue300}, 0.5)`}
          />
        ) : (
          <>
            {/*zero value of progress bar should be visible*/}
            <LinearProgress
              size="small"
              withoutLabel
              percent={votes.percAyes.eq(0) ? 2 : votes.percAyes.toNumber()}
              colorCustom={`linear-gradient(
            270deg,
            ${theme.colors.green600} 50%,
            transparent 100%
          )`}
            />
            <LinearProgress
              size="small"
              withoutLabel
              percent={votes.percNays.eq(0) ? 2 : votes.percNays.toNumber()}
              colorCustom={`linear-gradient(
              90deg,
              ${theme.colors.pink700} 50%,
              transparent 100%
            )`}
            />
          </>
        )}
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text
          color={votes.percAyes.eq(0) ? "darkBlue300" : "white"}
          fs={14}
          fw={600}
          tTransform="uppercase"
        >
          {t("toast.sidebar.referendums.aye")}
        </Text>
        <Text
          color={votes.percNays.eq(0) ? "darkBlue300" : "white"}
          fs={14}
          fw={600}
          tTransform="uppercase"
        >
          {t("toast.sidebar.referendums.nay")}
        </Text>
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="darkBlue300" fs={11} fw={500}>
          {t("toast.sidebar.referendums.value", {
            value: votes.ayes,
            percent: votes.percAyes,
          })}
        </Text>
        <Text color="darkBlue300" fs={11} fw={500}>
          {t("toast.sidebar.referendums.value", {
            value: votes.nays,
            percent: votes.percNays,
          })}
        </Text>
      </div>
    </SContainer>
  )
}
