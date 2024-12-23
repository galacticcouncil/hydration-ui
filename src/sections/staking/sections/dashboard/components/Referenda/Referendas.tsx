import {
  TReferenda,
  useOpenGovReferendas,
  useReferendaTracks,
} from "api/democracy"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useHDXSupplyFromSubscan } from "api/staking"
import {
  Dropdown,
  DropdownTriggerContent,
} from "components/Dropdown/DropdownRebranded"
import { useMemo, useState } from "react"
import { OpenGovReferenda } from "components/ReferendumCard/Referenda"
import { NoReferenda } from "components/ReferendumCard/NoReferenda"
import { ReferendaSkeleton } from "components/ReferendumCard/ReferendaSkeleton"

const defaultFilter = { key: "all", label: "ALL" }

export const OpenGovReferendas = () => {
  const { t } = useTranslation()
  const openGovQuery = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: hdxSupply, isLoading: isSupplyLoading } =
    useHDXSupplyFromSubscan()

  const [filter, setFilter] = useState(defaultFilter.key)

  const trackItems = useMemo(
    () =>
      tracks.data
        ? [
            defaultFilter,
            ...Array.from(tracks.data.entries()).map((track) => ({
              key: track[0],
              label: track[1].nameHuman,
            })),
          ].sort((a, b) => a.label.localeCompare(b.label))
        : null,
    [tracks.data],
  )

  const filtredReferenda = useMemo(() => {
    if (openGovQuery.data?.length && trackItems) {
      if (filter !== defaultFilter.key) {
        return openGovQuery.data.filter(
          (referenda) => referenda.referendum.track.toString() === filter,
        )
      } else {
        return openGovQuery.data
      }
    }
  }, [openGovQuery.data, trackItems, filter])

  const isLoading =
    openGovQuery.isLoading || isSupplyLoading || tracks.isLoading

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <div
        sx={{ flex: "row", justify: "space-between", gap: 4, align: "center" }}
      >
        <Text font="GeistMonoSemiBold" fs={22} lh={22}>
          {t("stats.overview.referenda.title")}
        </Text>
        {trackItems && (
          <Dropdown
            items={trackItems}
            align="end"
            onSelect={(item) => setFilter(item.key)}
          >
            <DropdownTriggerContent
              title="Track"
              value={trackItems.find((item) => item.key === filter)?.label}
            />
          </Dropdown>
        )}
      </div>

      {isLoading ? (
        <ReferendaSkeleton />
      ) : (
        <div sx={{ flex: "column", gap: 16 }}>
          {filtredReferenda?.length && tracks.data ? (
            filtredReferenda.map((referendum) => {
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
          ) : (
            <NoReferenda />
          )}
        </div>
      )}
      <Text
        lh={22}
        sx={{ width: "80%", m: "auto" }}
        css={{ color: "#DFB1F3" }}
        tAlign="center"
      >
        {t("stats.overview.referenda.desc")}
      </Text>
    </div>
  )
}
