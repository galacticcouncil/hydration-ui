import { u32 } from "@polkadot/types"
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
  poolId: u32
  className?: string
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const farms = useFarms(poolId)

  if (!farms.data?.length) {
    return <div />
  }

  return (
    <SInventivesContainer className={className}>
      <Text fs={13} color="basic400">
        {t("liquidity.asset.incentives.title")}
      </Text>
      <Spacer size={[10, 27]} />
      {isDesktop ? (
        <div sx={{ flex: "column", gap: 15 }}>
          {farms.data.map((farm, i) => (
            <GlobalFarmRow
              key={farm.yieldFarm.id.toString()}
              farm={farm}
              isLastElement={farms.data?.length === i + 1}
            />
          ))}
        </div>
      ) : (
        <GlobalFarmRowMulti farms={farms.data} />
      )}
    </SInventivesContainer>
  )
}
