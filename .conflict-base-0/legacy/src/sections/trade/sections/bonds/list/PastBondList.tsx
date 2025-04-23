import { isPoolUpdateEvent, useLBPPoolsEvents } from "api/bonds"
import { Bond, BondProps } from "components/Bond/Bond"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

export const PastBondList = ({ bonds }: { bonds: BondProps[] }) => {
  const bondsWithNoPool = bonds.filter((bond) => !bond.pool)
  const { t } = useTranslation()

  const events = useLBPPoolsEvents(bondsWithNoPool.map((bond) => bond.bond.id))

  const isLoading = events.some((event) => event.isLoading)
  const bondsWithPool = useMemo(
    () =>
      !isLoading
        ? bonds
            .map((bond) => {
              const bondEvents = events.find(
                (event) => event.data?.id === bond.bond.id,
              )?.data

              const isRemovedLiquidity = bondEvents?.events.some(
                (event) => event.name === "LBP.LiquidityRemoved",
              )

              if (bondEvents && isRemovedLiquidity) {
                const lbpPoolData = bondEvents.events
                  .filter(isPoolUpdateEvent)
                  .reverse()?.[0]

                if (lbpPoolData) {
                  const pool = lbpPoolData.args.data
                  return {
                    ...bond,
                    pool,
                  }
                }
              }

              return { ...bond }
            })
            .sort((a, b) => (b.pool?.end ?? 0) - (a.pool?.end ?? 0))
        : [],
    [bonds, events, isLoading],
  )

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <Text color="basic200" tTransform="uppercase" fs={15} font="GeistMono">
        {t("bonds.section.pastBonds")}
      </Text>
      {bondsWithPool.map((bond) => (
        <Bond key={bond.bond.id} {...bond} />
      ))}
    </div>
  )
}
