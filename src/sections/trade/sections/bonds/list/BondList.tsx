import { Bond } from "components/Bond/Bond"
import { format } from "date-fns"
import { useLbpPool } from "api/bonds"
import { BondListSkeleton } from "./BondListSkeleton"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useBestNumber } from "api/chain"
import { TBond } from "api/assetDetails"

type Props = {
  isLoading?: boolean
  bonds: TBond[]
}

export const BondList = ({ isLoading, bonds }: Props) => {
  const { t } = useTranslation()
  const lbpPool = useLbpPool()
  const bestNumber = useBestNumber()

  const currentBlockNumber = bestNumber.data?.relaychainBlockNumber.toNumber()

  const { active, upcoming, past } = currentBlockNumber
    ? bonds.reduce<{
        active: ReactNode[]
        upcoming: ReactNode[]
        past: ReactNode[]
      }>(
        (acc, bond) => {
          const pool = lbpPool.data?.find((pool) =>
            pool.assets.some((assetId: number) => assetId === Number(bond.id)),
          )

          if (pool && pool.start && pool.end) {
            const assetIn = pool.assets.find(
              (asset: number) => asset !== Number(bond.id),
            )
            const state =
              currentBlockNumber > Number(pool.start)
                ? currentBlockNumber > Number(pool.end)
                  ? "past"
                  : "active"
                : "upcoming"

            acc[state].push(
              <Bond
                assetId={bond.assetId}
                assetIn={assetIn}
                bondId={bond.id}
                key={bond.maturity}
                ticker={bond.symbol}
                name={bond.name}
                maturity={format(new Date(bond.maturity), "dd/MM/yyyy")}
                end={pool.end}
                start={pool.start}
                state={state}
              />,
            )
          } else {
            acc.past.push(
              <Bond
                assetId={bond.assetId}
                bondId={bond.id}
                key={bond.maturity}
                ticker={bond.symbol}
                name={bond.name}
                maturity={format(new Date(bond.maturity), "dd/MM/yyyy")}
                state="past"
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
