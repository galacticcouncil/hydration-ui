import {
  TReferenda,
  useAccountOpenGovVotes,
  useOpenGovReferendas,
  useReferendaTracks,
  useReferendums,
} from "api/democracy"
import { OpenGovReferenda } from "components/ReferendumCard/Referenda"
import { useHDXSupplyFromSubscan } from "api/staking"
import { ToastSidebarGroup } from "components/Toast/sidebar/group/ToastSidebarGroup"
import { useTranslation } from "react-i18next"
import { ReferendaDeprecated } from "components/ReferendumCard/ReferendaDeprecated"

export const ToastSidebarReferendums = () => {
  const { t } = useTranslation()
  const { data: accountVotes = [] } = useAccountOpenGovVotes()
  const { data: openGovQuery } = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: hdxSupply } = useHDXSupplyFromSubscan()
  const { data: referendums = [] } = useReferendums("ongoing")

  return (
    <ToastSidebarGroup title={t("toast.sidebar.referendums.title")} open={true}>
      <div sx={{ flex: "column", gap: 8 }}>
        {openGovQuery?.length && tracks.data
          ? openGovQuery.map((referendum) => {
              const track = tracks.data.get(
                referendum.referendum.track.toString(),
              ) as TReferenda

              return (
                <OpenGovReferenda
                  key={referendum.id}
                  id={referendum.id}
                  referenda={referendum.referendum}
                  track={track}
                  totalIssuance={hdxSupply?.totalIssuance}
                  voted={accountVotes.some((vote) => vote.id === referendum.id)}
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
