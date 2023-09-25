import { Bond } from "components/Bond/Bond"
import { format } from "date-fns"
import * as api from "api/bonds"
import { useLbpPool } from "api/bonds"
import { BondListSkeleton } from "./BondListSkeleton"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useBestNumber } from "api/chain"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  isLoading?: boolean
  bonds: api.Bond[]
}

export const BondList = ({ isLoading, bonds }: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
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
          const meta = assets.getAsset(bond.assetId)
          const date = new Date(bond.maturity)
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
                key={`${bond.assetId}_${bond.maturity}`}
                ticker={`${meta?.symbol}b`}
                name={getBondName(meta?.symbol ?? "", date, true)}
                maturity={format(date, "dd/MM/yyyy")}
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
                key={`${bond.assetId}_${bond.maturity}`}
                ticker={`${meta?.symbol}b`}
                name={getBondName(meta?.symbol ?? "", date, true)}
                maturity={format(date, "dd/MM/yyyy")}
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
