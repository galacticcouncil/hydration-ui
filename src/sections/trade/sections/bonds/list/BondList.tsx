import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { format } from "date-fns"
import * as api from "api/bonds"
import { u32 } from "@polkadot/types-codec"
import { u8 } from "@polkadot/types"
import { LINKS } from "utils/navigation"
import { useLbpPool } from "api/bonds"
import { useNavigate } from "@tanstack/react-location"
import { BondListSkeleton } from "./BondListSkeleton"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useBestNumber } from "api/chain"

type Props = {
  isLoading?: boolean
  bonds: api.Bond[]
  metas: { id: string; decimals: u32 | u8; symbol: string }[]
}

export const BondList = ({ isLoading, bonds, metas }: Props) => {
  const { t } = useTranslation()
  const lbpPool = useLbpPool()
  const navigate = useNavigate()
  const bestNumber = useBestNumber()

  const currentBlockNumber = bestNumber.data?.relaychainBlockNumber.toNumber()

  const { active, upcoming, past } = currentBlockNumber
    ? bonds.reduce<{
        active: ReactNode[]
        upcoming: ReactNode[]
        past: ReactNode[]
      }>(
        (acc, bond) => {
          const meta = metas.find((meta) => meta.id === bond.assetId)
          const date = new Date(bond.maturity)
          const pool = lbpPool?.data?.find((pool) =>
            pool.assets.some((assetId) => assetId === bond.id),
          )

          if (pool && pool.start && pool.end) {
            const assetIn = pool.assets.find((asset) => asset !== bond.id)
            const state =
              currentBlockNumber > Number(pool.start)
                ? currentBlockNumber > Number(pool.end)
                  ? "past"
                  : "active"
                : "upcoming"

            acc[state].push(
              <Bond
                assetId={bond.assetId}
                bondId={bond.id}
                key={`${bond.assetId}_${bond.maturity}`}
                icon={<AssetLogo id={bond.assetId} />}
                ticker={`${meta?.symbol}b`}
                name={getBondName(meta?.symbol ?? "", date, true)}
                maturity={format(date, "dd/MM/yyyy")}
                end={pool.end}
                start={pool.start}
                state={state}
                onDetailClick={() =>
                  navigate({
                    to: LINKS.bond,
                    search: { assetIn, assetOut: bond.id },
                  })
                }
              />,
            )
          }

          return acc
        },
        { active: [], upcoming: [], past: [] },
      )
    : { active: [], upcoming: [], past: [] }

  if (isLoading || bestNumber.isLoading) {
    return <BondListSkeleton />
  }

  return (
    <div sx={{ flex: "column", gap: 30 }}>
      {active.length ? (
        <div sx={{ flex: "column", gap: 12 }}>
          <Text
            color="brightBlue300"
            tTransform="uppercase"
            fs={15}
            font="FontOver"
          >
            {t("bonds.section.activeBonds")}
          </Text>
          {active}
        </div>
      ) : null}

      {upcoming.length ? (
        <div sx={{ flex: "column", gap: 12 }}>
          <Text
            color="brightBlue300"
            tTransform="uppercase"
            fs={15}
            font="FontOver"
          >
            {t("bonds.section.upcomingBonds")}
          </Text>
          {upcoming}
        </div>
      ) : null}

      {past.length ? (
        <div sx={{ flex: "column", gap: 12 }}>
          <Text color="basic200" tTransform="uppercase" fs={15} font="FontOver">
            {t("bonds.section.pastBonds")}
          </Text>
          {past}
        </div>
      ) : null}
    </div>
  )
}
