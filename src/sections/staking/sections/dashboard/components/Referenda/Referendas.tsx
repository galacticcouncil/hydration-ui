import {
  TReferenda,
  useAccountOpenGovVotes,
  useOpenGovReferendas,
  useReferendaTracks,
  useReferendums,
} from "api/democracy"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  Dropdown,
  DropdownTriggerContent,
} from "components/Dropdown/DropdownRebranded"
import { useMemo, useState } from "react"
import { OpenGovReferenda } from "components/ReferendumCard/Referenda"
import { NoReferenda } from "components/ReferendumCard/NoReferenda"
import { ReferendaSkeleton } from "components/ReferendumCard/ReferendaSkeleton"
import { ReferendaDeprecated } from "components/ReferendumCard/ReferendaDeprecated"
import { useHDXIssuance } from "api/balances"

const defaultFilter = { key: "all", label: "ALL" }

export const OpenGovReferendas = () => {
  const { t } = useTranslation()
  const { data: accountVotes = [], isInitialLoading: isLoadingAccountVotes } =
    useAccountOpenGovVotes()
  const { data: referendas, isLoading: isLoadingReferendas } =
    useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const { data: HDXIssuance, isLoading: isHDXIssuanceLoading } =
    useHDXIssuance()
  const { data: referendums = [], isLoading: IsReferendumsLoading } =
    useReferendums("ongoing")
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
    if (referendas?.length && trackItems) {
      if (filter !== defaultFilter.key) {
        return referendas.filter(
          (referenda) => referenda.referendum.track.toString() === filter,
        )
      } else {
        return referendas
      }
    }
  }, [referendas, trackItems, filter])

  const isLoading =
    isLoadingReferendas ||
    isHDXIssuanceLoading ||
    tracks.isLoading ||
    isLoadingAccountVotes ||
    IsReferendumsLoading

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
                  totalIssuance={HDXIssuance}
                  voted={accountVotes.some((vote) => vote.id === referendum.id)}
                />
              )
            })
          ) : referendums.length ? null : (
            <NoReferenda />
          )}
          {referendums.map((referendum) => (
            <ReferendaDeprecated
              key={referendum.id}
              id={referendum.id}
              referendum={referendum.referendum}
              type="staking"
              voted={false}
            />
          ))}
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
