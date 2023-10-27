import { useFarms } from "api/farms"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { GlobalFarmRow } from "sections/pools/farms/components/globalFarm/GlobalFarmRow"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { theme } from "theme"
import { SInventivesContainer } from "./PoolIncentives.styled"

export const PoolIncentives = ({
  poolId,
  className,
}: {
  poolId: string
  className?: string
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const farms = useFarms([poolId])

  if (!farms.data?.length) {
    return <div />
  }

  return (
    <SInventivesContainer className={className}>
      <Text fs={13} color="basic400">
        {t("liquidity.asset.incentives.title")}
      </Text>
      <Spacer size={[10, 27]} />
      <div sx={{ flex: "column", gap: "15px" }}>
        {isDesktop ? (
          farms.data.map((farm) => (
            <GlobalFarmRow key={farm.yieldFarm.id.toString()} farm={farm} />
          ))
        ) : (
          <GlobalFarmRowMulti farms={farms.data} />
        )}
      </div>
    </SInventivesContainer>
  )
}
