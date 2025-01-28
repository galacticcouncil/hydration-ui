import {
  TReferenda,
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
  const openGovQuery = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: hdxSupply } = useHDXSupplyFromSubscan()
  const { data: referendums = [] } = useReferendums("ongoing")

  return (
    <ToastSidebarGroup title={t("toast.sidebar.referendums.title")} open={true}>
      <div sx={{ flex: "column", gap: 8 }}>
        {openGovQuery.data?.length && tracks.data
          ? openGovQuery.data.map((referendum) => {
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
