import { BasiliskIcon } from "assets/icons/BasiliskIcon"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { AvailableFarms, FarmsWrapper, JoinedFarms } from "./Farms.styled"

type FarmProps = {}

export const Farms: FC<FarmProps> = () => {
  const { t } = useTranslation()
  return (
    <FarmsWrapper>
      <JoinedFarms>
        <Box flex acenter>
          <Text
            fs={12}
            mr={10}
            text={t("farmsPoolsPage.poolCard.positions.farm.joinedFarms")}
          />
          <Icon icon={<BasiliskIcon />} size={26} />
          <Icon icon={<BasiliskIcon />} mr={5} size={26} />
          <Text fs={14} color="primary200">
            5-10% APR
          </Text>
        </Box>
        <Button
          text={t("farmsPoolsPage.poolCard.positions.farm.details")}
          width={120}
          size="small"
        />
      </JoinedFarms>
      <AvailableFarms>
        <Box flex acenter>
          <GradientText
            text={t("farmsPoolsPage.poolCard.positions.farm.openFarm")}
            fs={12}
            mr={10}
          />
          <Icon icon={<BasiliskIcon />} mr={5} size={26} />
          <Text fs={14} color="primary200">
            5-10% APR
          </Text>
        </Box>
        <Button
          text={t("farmsPoolsPage.poolCard.positions.farm.join")}
          width={120}
          variant="primary"
          size="small"
        />
      </AvailableFarms>
    </FarmsWrapper>
  )
}
