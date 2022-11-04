import { Trans, useTranslation } from "react-i18next"
import { SFarm, SFarmIcon, SFarmRow } from "./PoolFarmDetail.styled"
import { Text } from "components/Typography/Text/Text"
import { FillBar } from "components/FillBar/FillBar"
import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { AprFarm } from "utils/farms/apr"
import { useAsset } from "api/asset"
import { addSeconds } from "date-fns"
import { BLOCK_TIME } from "utils/constants"
import { useBestNumber } from "api/chain"
import { getFloatingPointAmount } from "utils/balance"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { DepositNftType } from "api/deposits"
import { Tag } from "components/Tag/Tag"
import { PoolBase } from "@galacticcouncil/sdk"

export const PoolFarmDetail = (props: {
  pool: PoolBase
  farm: AprFarm
  depositNft?: DepositNftType
  onSelect?: () => void
}) => {
  const asset = useAsset(props.farm.assetId)
  const { t } = useTranslation()

  const bestNumber = useBestNumber()
  if (!bestNumber?.data) return null

  const blockDurationToEnd = props.farm.estimatedEndBlock.minus(
    bestNumber.data.relaychainBlockNumber.toBigNumber(),
  )

  const secondsDurationToEnd = blockDurationToEnd.times(BLOCK_TIME)

  const [assetIn, assetOut] = props.pool.tokens

  return (
    <SFarm
      as={props.onSelect ? "button" : "div"}
      variant={props.onSelect ? "list" : "detail"}
      onClick={props.onSelect}
      isJoined={!!props.depositNft}
    >
      {props.depositNft && <Tag>{t("pools.allFarms.modal.joined")}</Tag>}
      <div
        sx={{
          flex: ["row", "column"],
          justify: ["space-between", "start"],
          gap: 8,
        }}
      >
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          {asset.data?.icon}
          <Text fw={700}>{asset.data?.name}</Text>
        </div>
        <Text fs={20} lh={28} fw={600} color="primary200">
          {t("pools.allFarms.modal.apr.single", { value: props.farm.apr })}
        </Text>
      </div>
      <div sx={{ flex: "column" }}>
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
        {props.depositNft && (
          <SFarmRow>
            <GradientText fs={14} fw={550}>
              {t("pools.allFarms.modal.lockedShares")}
            </GradientText>
            <Text fs={14} color="neutralGray100">
              {t("pools.allFarms.modal.lockedShares.value", {
                value: props.depositNft.deposit.shares,
                assetA: assetIn.symbol,
                assetB: assetOut.symbol,
              })}
            </Text>
          </SFarmRow>
        )}
        <Text fs={12} lh={16} fw={400} color="neutralGray500">
          {t("pools.allFarms.modal.end", {
            end: addSeconds(new Date(), secondsDurationToEnd.toNumber()),
          })}
        </Text>
      </div>
      {props.onSelect && (
        <SFarmIcon>
          <ChevronDown />
        </SFarmIcon>
      )}
    </SFarm>
  )
}
