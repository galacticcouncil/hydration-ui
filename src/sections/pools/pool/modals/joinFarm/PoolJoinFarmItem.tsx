import { Trans, useTranslation } from "react-i18next"
import {
  SFarm,
  SFarmIcon,
  SFarmRow,
} from "sections/pools/pool/modals/joinFarm/PoolJoinFarm.styled"
import { Box } from "components/Box/Box"
import { Text } from "components/Typography/Text/Text"
import { FillBar } from "components/FillBar/FillBar"
import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { AprFarm } from "utils/apr"
import { useAsset } from "api/asset"
import { addSeconds } from "date-fns"
import { BLOCK_TIME } from "utils/constants"
import { useBestNumber } from "api/chain"
import { getFloatingPointAmount } from "utils/balance"

export const PoolJoinFarmItem = (props: {
  farm: AprFarm
  onSelect: () => void
  variant: "list" | "detail"
}) => {
  const asset = useAsset(props.farm.assetId)
  const { t } = useTranslation()

  const bestNumber = useBestNumber()
  if (!bestNumber?.data) return null

  const blockDurationToEnd = props.farm.estimatedEndBlock.minus(
    bestNumber.data.toBigNumber(),
  )

  const secondsDurationToEnd = blockDurationToEnd.times(BLOCK_TIME)

  return (
    <SFarm
      as={props.variant === "detail" ? "div" : "button"}
      variant={props.variant}
      onClick={props.onSelect}
    >
      <Box flex column gap={8}>
        <Box flex acenter gap={8}>
          {asset.data?.icon}
          <Text fw={700}>{asset.data?.name}</Text>
        </Box>
        <Text fs={20} lh={28} fw={600} color="primary200">
          {t("pools.allFarms.modal.apr.single", {
            value: props.farm.apr,
          })}
        </Text>
      </Box>
      <Box flex column>
        <SFarmRow>
          <FillBar
            percentage={props.farm.distributedRewards
              .div(props.farm.maxRewards)
              .times(100)
              .toNumber()}
          />
          <Text>
            <Trans
              t={t}
              i18nKey="pools.allFarms.modal.distribution"
              tOptions={{
                distributed: getFloatingPointAmount(
                  props.farm.distributedRewards,
                  12,
                ),
                max: getFloatingPointAmount(props.farm.maxRewards, 12),
              }}
            >
              <Text as="span" fs={14} color="neutralGray100" />
              <Text as="span" fs={14} color="neutralGray300" />
            </Trans>
          </Text>
        </SFarmRow>
        <SFarmRow>
          <FillBar percentage={props.farm.fullness.times(100).toNumber()} />
          <Text fs={14} color="neutralGray100">
            {t("pools.allFarms.modal.capacity", {
              capacity: props.farm.fullness.times(100),
              decimalPlaces: 0,
            })}
          </Text>
        </SFarmRow>
        <Text fs={12} lh={16} fw={400} color="neutralGray500">
          {t("pools.allFarms.modal.end", {
            end: addSeconds(new Date(), secondsDurationToEnd.toNumber()),
          })}
        </Text>
      </Box>
      {props.variant === "list" && (
        <SFarmIcon>
          <ChevronDown />
        </SFarmIcon>
      )}
    </SFarm>
  )
}
