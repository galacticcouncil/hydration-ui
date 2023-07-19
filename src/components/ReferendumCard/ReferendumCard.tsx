import { PalletDemocracyReferendumInfo } from "@polkadot/types/lookup"
import { useReferendumInfo } from "api/democracy"
import { ReactComponent as LinkIcon } from "assets/icons/LinkPixeled.svg"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { BN_0, BN_10 } from "utils/constants"
import { SBar, SContainer, SHeader } from "./ReferendumCard.styled"
import { ReferendumCardSkeleton } from "./ReferendumCardSkeleton"
import { Icon } from "components/Icon/Icon"

const REFERENDUM_LINK = import.meta.env.VITE_REFERENDUM_LINK as string

type Props = {
  id: string
  referendum: PalletDemocracyReferendumInfo
  type: "toast" | "staking"
}

export const ReferendumCard = ({ id, referendum, type }: Props) => {
  const { t } = useTranslation()

  const info = useReferendumInfo(id)

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

  if (!info.data) return null

  return info.isLoading || !info.data ? (
    <ReferendumCardSkeleton type={type} />
  ) : (
    <SContainer type={type}>
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text color="brightBlue200" fs={14} fw={500}>
            #{info.data.motionIndex}
          </Text>
          <Text color="brightBlue200" fs={12} fw={500}>
            {"//"}
          </Text>
          <Text color="basic500" fs={13} fw={500}>
            {info.data.lastActivityAt &&
              t("toast.date", { value: new Date(info.data.lastActivityAt) })}
          </Text>
        </div>

        <a
          href={`${REFERENDUM_LINK}/${info.data.referendumIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          <Icon sx={{ color: "brightBlue300" }} icon={<LinkIcon />} />
        </a>
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Text color="white" fw={500}>
        {info.data.title}
      </Text>

      <Spacer size={20} />

      <div sx={{ flex: "row", gap: 8 }}>
        <SBar variant="aye" percentage={votes.percAyes.toNumber()} />
        <SBar variant="nay" percentage={votes.percNays.toNumber()} />
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="white" fs={14} fw={600}>
          {t("toast.sidebar.referendums.aye")}
        </Text>
        <Text color="white" fs={14} fw={600}>
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
