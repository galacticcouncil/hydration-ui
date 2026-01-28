import {
  Box,
  Button,
  Flex,
  Modal,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ClaimStakingRemainder } from "@/modules/staking/ClaimStakingRemainder"
import { ClaimStakingWarning } from "@/modules/staking/ClaimStakingWarning"
import { RewardsCurve } from "@/modules/staking/RewardsCurve"
import {
  SRemainderContainer,
  SRewardsListChartContainer,
} from "@/modules/staking/RewardsList.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly positionId: bigint
  readonly claimableRewards: string
  readonly unclaimableRewards: string
  readonly allocatedRewardsPercentage: number
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
  readonly isLoading: boolean
}

export const RewardsList: FC<Props> = ({
  positionId,
  claimableRewards,
  unclaimableRewards,
  allocatedRewardsPercentage,
  votes,
  votesSuccess,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  const [claimModal, setClaimModal] = useState(false)
  const [claimableDisplay] = useDisplayAssetPrice(native.id, claimableRewards)

  return (
    <Box>
      <SRewardsListChartContainer>
        <Flex direction="column" gap="xl">
          <Text
            sx={{ whiteSpace: "nowrap" }}
            fw={500}
            fs="p2"
            lh={1.2}
            color={getToken("text.high")}
          >
            {t("staking:dashboard.available")}
          </Text>
          <Flex
            direction={["row", "column"]}
            justify={["space-between", "flex-start"]}
            gap={[0, 22]}
          >
            <Flex direction="column" gap="xs">
              {isLoading ? (
                <Skeleton height={24} />
              ) : (
                <Text
                  font="primary"
                  fw={500}
                  fs="h6"
                  lh={1}
                  color={getToken("text.high")}
                >
                  {t("currency", {
                    value: claimableRewards,
                    symbol: native.symbol,
                  })}
                </Text>
              )}
              {isLoading ? (
                <Skeleton height={20} />
              ) : (
                <Text fs="p3" lh={1.4} color={getToken("text.onTint")}>
                  ≈{claimableDisplay}
                </Text>
              )}
            </Flex>
            <Flex direction="column" gap="xs">
              <Text
                font="primary"
                fw={500}
                fs="h6"
                lh={1}
                color={getToken("text.high")}
              >
                {t("percent", { value: allocatedRewardsPercentage })}
              </Text>
              {isLoading ? (
                <Skeleton height={20} />
              ) : (
                <Text fs="p3" lh={1.4} color={getToken("text.onTint")}>
                  {t("staking:dashboard.ofAllocated")}
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        <RewardsCurve />
      </SRewardsListChartContainer>
      <SRemainderContainer>
        <ClaimStakingRemainder
          sx={{ fontSize: 14, color: getToken("text.high") }}
          unclaimable={unclaimableRewards}
        />
        <Button
          variant="secondary"
          disabled={Big(claimableRewards).lte(0)}
          onClick={() => setClaimModal(true)}
        >
          {t("staking:dashboard.remainder.cta")}
        </Button>
      </SRemainderContainer>
      <Modal open={claimModal} onOpenChange={setClaimModal}>
        <ClaimStakingWarning
          positionId={positionId}
          unclaimable={unclaimableRewards}
          votes={votes}
          votesSuccess={votesSuccess}
          onClose={() => setClaimModal(false)}
        />
      </Modal>
    </Box>
  )
}
