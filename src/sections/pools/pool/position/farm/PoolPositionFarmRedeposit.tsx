import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PoolBase } from "@galacticcouncil/sdk"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Button } from "components/Button/Button"
import { AprFarm, useAPR } from "utils/farms/apr"
import { useAccountStore } from "state/store"
import { useAccountDepositIds, useDeposits } from "api/deposits"
import { useRedepositMutation } from "utils/farms/redeposit"
import { useAsset } from "api/asset"
import { theme } from "theme"
import { Fragment } from "react"
import { SContainer, SInnerContainer } from "./PoolPositionFarmRedeposit.styled"

const PoolPositionFarmRedepositAsset = (props: {
  pool: PoolBase
  farm: AprFarm
  hideName?: boolean
}) => {
  const { t } = useTranslation()
  const asset = useAsset(props.farm.assetId)
  if (!asset.data) return null

  return (
    <div sx={{ flex: "row", align: "center", gap: 6 }}>
      {asset.data.icon}
      {!props.hideName && (
        <Text fs={14} lh={16}>
          {asset.data.name}
        </Text>
      )}
      <Text fs={14} lh={16} color="primary200">
        {t("value.APR", { apr: props.farm.apr })}
      </Text>
    </div>
  )
}

export const PoolPositionFarmRedeposit = (props: {
  pool: PoolBase
  className?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const apr = useAPR(props.pool.address)
  const deposits = useDeposits(props.pool.address)
  const accountDepositIds = useAccountDepositIds(account?.address)

  const depositNfts = deposits.data?.filter((deposit) =>
    accountDepositIds.data?.some((ad) => ad.instanceId.eq(deposit.id)),
  )
  let availableYieldFarms = apr.data.filter(
    (farm) =>
      !depositNfts?.find((deposit) =>
        deposit.deposit.yieldFarmEntries.find(
          (entry) =>
            entry.globalFarmId.eq(farm.globalFarm.id) &&
            entry.yieldFarmId.eq(farm.yieldFarm.id),
        ),
      ),
  )

  const redeposit = useRedepositMutation(
    props.pool,
    availableYieldFarms,
    depositNfts ?? [],
  )

  const isMultiple = availableYieldFarms.length > 1

  if (!availableYieldFarms.length) return null
  return (
    <SContainer isMultiple={isMultiple}>
      <SInnerContainer>
        <GradientText fs={12} fw={400}>
          {t("pools.pool.positions.farms.redeposit.title")}
        </GradientText>

        <div sx={{ flex: "row", gap: 20, align: "center", ml: 12, mr: 20 }}>
          {availableYieldFarms.map((farm, i) => (
            <Fragment key={`${farm.globalFarm.id}-${farm.yieldFarm.id}`}>
              <PoolPositionFarmRedepositAsset
                hideName={!isMultiple}
                farm={farm}
                pool={props.pool}
              />

              {i + 1 !== availableYieldFarms.length && (
                <span
                  sx={{ width: 1, height: 35 }}
                  css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
                />
              )}
            </Fragment>
          ))}
        </div>

        <Button
          size="small"
          variant="primary"
          disabled={redeposit.isLoading}
          onClick={() => redeposit.mutate()}
        >
          {t("pools.pool.positions.farms.redeposit.join")}
        </Button>
      </SInnerContainer>
    </SContainer>
  )
}
