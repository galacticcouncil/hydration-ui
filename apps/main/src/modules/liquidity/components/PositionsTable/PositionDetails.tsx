import {
  Amount,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { XykDeposit } from "@/api/account"
import { Farm } from "@/api/farms"
import { AvailableFarms } from "@/modules/liquidity/components/AvailableFarms/AvailableFarms"
import { FarmDetails } from "@/modules/liquidity/components/AvailableFarms/FarmDetails"
import {
  TJoinedFarm,
  useExitDepositFarmsMutation,
} from "@/modules/liquidity/components/Farms/Farms.utils"
import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms/JoinFarms"
import {
  useClaimFarmRewardsMutation,
  useClaimPositionRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import {
  isXykDepositPosition,
  OmnipoolDepositFullWithData,
} from "@/states/account"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

export const PositionDetails = ({
  joinedFarms,
  farmsToJoin,
  position,
}: {
  joinedFarms: TJoinedFarm[]
  farmsToJoin: Farm[]
  position: OmnipoolDepositFullWithData | XykDeposit
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [open, setOpen] = useState(false)
  const exitDepositFarmsMutation = useExitDepositFarmsMutation(position)
  const { claimableValues, rewards, refetch } =
    useClaimPositionRewards(position)
  const { mutate: claimRewards } = useClaimFarmRewardsMutation({
    claimableDeposits: rewards ?? [],
    onSuccess: () => refetch(),
  })

  const format = useFormatOmnipoolPositionData()
  const isXyk = isXykDepositPosition(position)

  return (
    <>
      <ModalHeader title={t("liquidity.position.modal.title")} />
      <ModalBody>
        {isXyk ? null : (
          <Flex
            justify="space-between"
            m={getTokenPx("containers.paddings.tertiary")}
            mt={0}
          >
            <Amount
              label={t("common:initialValue")}
              value={t("common:currency", {
                value: position.data.initialValueHuman,
                symbol: position.data.meta.symbol,
              })}
              displayValue={t("common:currency", {
                value: position.data.initialDisplay,
              })}
            />
            <Amount
              label={t("common:currentValue")}
              value={format(position.data)}
              displayValue={t("common:currency", {
                value: position.data.currentTotalDisplay,
              })}
            />
          </Flex>
        )}

        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.primary")}
        >
          {joinedFarms.map((joinedFarm) => (
            <FarmDetails
              key={joinedFarm.farm.globalFarmId}
              farm={joinedFarm.farm}
              joinedFarm={joinedFarm}
            />
          ))}
        </Flex>

        {!!farmsToJoin.length && (
          <Flex
            align="center"
            gap={getTokenPx("containers.paddings.quint")}
            justify="space-between"
            my={getTokenPx("containers.paddings.quart")}
          >
            <Text
              fs="p3"
              fw={500}
              color={getToken("text.tint.primary")}
              font="primary"
            >
              {t("liquidity.position.availableFarms.label")}
            </Text>
            <Button size="small" onClick={() => setOpen(true)}>
              {t("liquidity.availableFarms.join")}
            </Button>
          </Flex>
        )}

        <AvailableFarms farms={farmsToJoin} />

        <Text
          fs="p3"
          fw={400}
          color={getToken("text.tint.primary")}
          sx={{
            textAlign: "center",
            py: getTokenPx("containers.paddings.secondary"),
          }}
        >
          {t("liquidity.availableFarms.modal.graph.description")}
        </Text>
      </ModalBody>
      <ModalFooter justify="space-between">
        <Button
          variant="tertiary"
          size="large"
          onClick={() => exitDepositFarmsMutation.mutate()}
        >
          {t("liquidity.position.exitFarms.label")}
        </Button>
        <Button
          size="large"
          disabled={claimableValues.totalUSD === "0"}
          onClick={() =>
            claimRewards({ displayValue: claimableValues.totalUSD })
          }
        >
          {t("liquidity.claimCard.claim")}
        </Button>
      </ModalFooter>
      <Modal open={open} onOpenChange={setOpen}>
        <JoinFarmsWrapper
          poolId={isXyk ? position.amm_pool_id : position.assetId}
          positionId={isXyk ? position.id : position.positionId}
          onSubmitted={() => setOpen(false)}
          closable
        />
      </Modal>
    </>
  )
}
