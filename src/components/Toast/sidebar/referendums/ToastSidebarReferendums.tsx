import {
  TReferenda,
  useOpenGovReferendas,
  useReferendaTracks,
} from "api/democracy"
import { OpenGovReferenda } from "components/ReferendumCard/Referenda"
import { useHDXSupplyFromSubscan } from "api/staking"
import { ToastSidebarGroup } from "components/Toast/sidebar/group/ToastSidebarGroup"
import { useTranslation } from "react-i18next"

export const ToastSidebarReferendums = () => {
  const { t } = useTranslation()
  const openGovQuery = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: hdxSupply } = useHDXSupplyFromSubscan()

  return (
    <ToastSidebarGroup
      title={t("toast.sidebar.referendums.title")}
      open={false}
    >
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
      </div>
    </ToastSidebarGroup>
  )
}
