import {
  TReferenda,
  useAccountOpenGovVotes,
  useOpenGovReferendas,
  useReferendaTracks,
  useReferendums,
} from "api/democracy"
import { OpenGovReferenda } from "components/ReferendumCard/Referenda"
import { ToastSidebarGroup } from "components/Toast/sidebar/group/ToastSidebarGroup"
import { useTranslation } from "react-i18next"
import { ReferendaDeprecated } from "components/ReferendumCard/ReferendaDeprecated"
import { splitReferendaByVoted } from "components/Toast/sidebar/referendums/ToastSidebarReferendums.utils"
import { useHDXIssuance } from "api/balances"

export const ToastSidebarReferendums = () => {
  const { t } = useTranslation()
  const { data: accountVotes = [] } = useAccountOpenGovVotes()
  const { data: openGovQuery = [] } = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: HDXIssuance } = useHDXIssuance()
  const { data: referendums = [] } = useReferendums("ongoing")

  const { openGovNonVoted, openGovVoted } = splitReferendaByVoted(
    openGovQuery,
    accountVotes,
  )

  const openGovSorted = openGovNonVoted.concat(openGovVoted)

  return (
    <ToastSidebarGroup
      title={t("toast.sidebar.referendums.title")}
      info={
        openGovNonVoted.length
          ? t("toast.sidebar.referendums.nonVoted", {
              count: openGovNonVoted.length,
            })
          : undefined
      }
      open={false}
    >
      <div sx={{ flex: "column", gap: 8 }}>
        {openGovSorted.length && tracks.data
          ? openGovSorted.map((referendum) => {
              const track = tracks.data.get(
                referendum.referendum.track.toString(),
              ) as TReferenda

              return (
                <OpenGovReferenda
                  key={referendum.id}
                  id={referendum.id}
                  referenda={referendum.referendum}
                  track={track}
                  totalIssuance={HDXIssuance}
                  voted={referendum.hasVoted}
                />
              )
            })
          : null}
        {referendums &&
          referendums.map((referendum) => (
            <ReferendaDeprecated
              key={referendum.id}
              id={referendum.id}
              referendum={referendum.referendum}
              type="staking"
              voted={false}
            />
          ))}
      </div>
    </ToastSidebarGroup>
  )
}
