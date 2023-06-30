import { Referendum, useReferendumInfo } from "api/democracy"
import { ReactComponent as IconLink } from "assets/icons/LinkIcon.svg"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SHeader } from "./ReferendumCard.styled"
import { PalletDemocracyReferendumInfo } from "@polkadot/types/lookup"
import { useMemo } from "react"
import { BN_0, BN_10 } from "utils/constants"

const REFERENDUM_LINK = import.meta.env.VITE_REFERENDUM_LINK as string

type Props = { id: string; referendum: PalletDemocracyReferendumInfo }

export const ReferendumCard = ({ id, referendum }: Props) => {
  const { t } = useTranslation()

  const info = useReferendumInfo(id)
  const ref = info.data

  console.log(ref)

  const votes = useMemo(() => {
    return { ayes: BN_0, nays: BN_0, percAyes: BN_0, percNays: BN_0 }

    const ayes = referendum.asOngoing.tally.ayes
      .toBigNumber()
      .div(BN_10.pow(12))
    const nays = referendum.asOngoing.tally.nays
      .toBigNumber()
      .div(BN_10.pow(12))

    const votesSum = ayes.plus(nays)
    const percAyes = ayes.div(votesSum).times(100)
    const percNays = nays.div(votesSum).times(100)

    return { ayes, nays, percAyes, percNays }
  }, [
    referendum.asOngoing.tally.ayes,
    referendum.asOngoing.tally.nays,
    referendum.isOngoing,
  ])

  if (!ref) return null

  return (
    <SContainer>
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text color="brightBlue200" fs={14} fw={500}>
            #{ref.motionIndex}
          </Text>
          <Text color="brightBlue200" fs={12} fw={500}>
            {"//"}
          </Text>
          <Text color="basic500" fs={13} fw={500}>
            {ref.lastActivityAt &&
              t("toast.date", { value: new Date(ref.lastActivityAt) })}
          </Text>
        </div>

        <a
          href={`${REFERENDUM_LINK}/${ref.referendumIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          <IconLink sx={{ color: "brightBlue300", width: 12, height: 12 }} />
        </a>
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Text color="white" fw={500}>
        {ref.title}
      </Text>

      <Spacer size={20} />

      <div>bars</div>

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
