import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  AvailableFarms,
  FarmsWrapper,
  JoinedFarms,
} from "sections/pools/pool/shares/positions/farms/PoolSharesPositionsFarms.styled"

export const PoolSharesPositionsFarms = () => {
  const { t } = useTranslation()
  return (
    <FarmsWrapper>
      <JoinedFarms>
        <Box flex acenter>
          <Text
            fs={12}
            mr={10}
            text={t("pools.pool.positions.farms.joinedFarms")}
          />
          <DualAssetIcons
            firstIcon={{
              icon: <BasiliskIcon />,
              withChainedIcon: false,
            }}
            secondIcon={{ icon: <BasiliskIcon />, withChainedIcon: false }}
          />
          <Text fs={14} color="primary200">
            5-10% APR
          </Text>
        </Box>
        <Button
          text={t("pools.pool.positions.farms.details")}
          width={120}
          size="small"
        />
      </JoinedFarms>
      <AvailableFarms>
        <Box flex acenter>
          <GradientText
            text={t("pools.pool.positions.farms.openFarm")}
            fs={12}
            mr={10}
          />
          <Icon icon={<BasiliskIcon />} mr={5} size={26} />
          <Text fs={14} color="primary200">
            5-10% APR
          </Text>
        </Box>
        <Button
          text={t("pools.pool.positions.farms.join")}
          width={120}
          variant="primary"
          size="small"
        />
      </AvailableFarms>
    </FarmsWrapper>
  )
}
