import {
  Amount,
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { preventDefault } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { Farm, useOmnipoolActiveFarm } from "@/api/farms"
import { AvailableFarms } from "@/modules/liquidity/components/AvailableFarms"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountOmnipoolPositionsData } from "@/states/account"

import { JoinFarmsSkeleton } from "./JoinFarmsSkeleton"

type JoinFarmsProps = {
  positionId: string
  poolId: string
  closable?: boolean
}

export const JoinFarmsWrapper = ({ poolId, ...props }: JoinFarmsProps) => {
  const { data: farms, isLoading } = useOmnipoolActiveFarm(poolId)

  const activeFarms = farms?.filter((farm) => farm.apr !== "0") ?? []

  if (isLoading || !activeFarms.length) return <JoinFarmsSkeleton />

  return <JoinFarms farms={activeFarms} poolId={poolId} {...props} />
}

export const JoinFarms = ({
  positionId,
  poolId,
  closable,
  farms,
}: JoinFarmsProps & { farms: Farm[] }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const { getAssetPositions } = useAccountOmnipoolPositionsData()
  const { omnipool } = getAssetPositions(poolId)
  const position = omnipool.find(
    (position) => position.positionId === positionId,
  )

  return (
    <>
      <ModalHeader title={t("joinFarms")} closable={closable} />
      <ModalBody>
        <AvailableFarms farms={farms} />
        <form autoComplete="off" onSubmit={preventDefault}>
          <ModalContentDivider
            sx={{ mt: getTokenPx("containers.paddings.primary") }}
          />

          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quart")}
            py={getTokenPx("containers.paddings.secondary")}
          >
            <Text fs={14} fw={500} font="primary" color={getToken("text.high")}>
              {t("liquidity.joinFarms.modal.currentPositionValue")}
            </Text>
            <Flex align="center" justify="space-between" gap={8}>
              <Text
                color={getToken("text.medium")}
                fs="p5"
                fw={400}
                width={220}
              >
                {t("liquidity.joinFarms.modal.description")}
              </Text>
              {position?.data ? (
                <Amount
                  value={t("common:currency", {
                    value: position.data.currentTotalValueHuman,
                    symbol: meta.symbol,
                  })}
                  displayValue={t("common:currency", {
                    value: position.data.currentTotalDisplay,
                  })}
                  size="large"
                />
              ) : null}
            </Flex>
          </Flex>

          <ModalContentDivider />

          <Button
            type="submit"
            size="large"
            width="100%"
            mt={getTokenPx("containers.paddings.primary")}
            disabled={false}
          >
            {t("liquidity.joinFarms.modal.submit", {
              amount: farms.length,
            })}
          </Button>
        </form>
      </ModalBody>
    </>
  )
}
