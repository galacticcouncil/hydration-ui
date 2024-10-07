import {
  TReferenda,
  useOpenGovReferendas,
  useReferendaTracks,
  useReferendums,
} from "api/democracy"
import { ReferendumCard } from "components/ReferendumCard/ReferendumCard"
import { ReferendumCardSkeleton } from "components/ReferendumCard/ReferendumCardSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/staking/StakingPage.styled"
import GovernanceIcon from "assets/icons/GovernanceIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { ReferendumCardRococo } from "components/ReferendumCard/ReferendumCardRococo"
import { useProviderRpcUrlStore } from "api/provider"
import { theme } from "theme"
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

type ReferendaProps = {
  loading: boolean
  data?: ReturnType<typeof useReferendums>["data"]
}

export const ReferendaWrapper = () => {
  const referendums = useReferendums("ongoing")

  return <Referenda data={referendums.data} loading={referendums.isLoading} />
}

export const Referenda = ({ data, loading }: ReferendaProps) => {
  const { t } = useTranslation()
  const providers = useProviderRpcUrlStore()
  const rococoProvider = [
    "hydradx-rococo-rpc.play.hydration.cloud",
    "mining-rpc.hydradx.io",
  ].find(
    (rpc) =>
      (providers.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL) ===
      `wss://${rpc}`,
  )

  return (
    <SContainer sx={{ p: [24, "25px 20px 20px"], gap: 21 }}>
      <Text font="GeistMono" fs={19}>
        {t("stats.overview.referenda.title")}
      </Text>
      {loading ? (
        <ReferendumCardSkeleton type="staking" />
      ) : data?.length ? (
        <div sx={{ flex: "column", gap: 16 }}>
          <Text lh={22} css={{ color: `rgba(${theme.rgbColors.white}, 0.6)` }}>
            {t("stats.overview.referenda.desc")}
          </Text>
          {data.map((referendum) =>
            rococoProvider ? (
              <ReferendumCardRococo
                key={referendum.id}
                type="staking"
                rpc={rococoProvider}
                {...referendum}
              />
            ) : (
              <ReferendumCard
                key={referendum.id}
                type="staking"
                {...referendum}
              />
            ),
          )}
        </div>
      ) : (
        <div sx={{ flex: "row", align: "center", gap: 16, my: 16 }}>
          <Icon sx={{ color: "basic600" }} icon={<GovernanceIcon />} />
          <Text color="basic700">
            {t("stats.overview.referenda.emptyState")}
          </Text>
        </div>
      )}
    </SContainer>
  )
}

export const OpenGovReferendas = () => {
  const { t } = useTranslation()
  const openGovQuery = useOpenGovReferendas()
  const tracks = useReferendaTracks()
  const HDXSupply = useHDXSupplyFromSubscan()

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
    openGovQuery.isLoading || HDXSupply.isLoading || tracks.isLoading

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <div
        sx={{ flex: "row", justify: "space-between", gap: 4, align: "center" }}
      >
        <Text font="GeistMonoSemiBold" fs={22} lh={22}>
          Ongoing referenda
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
                  totalIssuance={HDXSupply.data?.total_issuance}
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
