import {
  Box,
  Button,
  Flex,
  Modal,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ClaimStakingRemainder } from "@/modules/staking/ClaimStakingRemainder"
import { ClaimStakingWarning } from "@/modules/staking/ClaimStakingWarning"
import { RewardsCurve } from "@/modules/staking/RewardsCurve"
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
      <Flex
        sx={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        px={getTokenPx("containers.paddings.primary")}
        py={getTokenPx("containers.paddings.primary")}
        bg={getToken("surfaces.containers.mid.primary")}
        borderWidth={1}
        borderStyle="solid"
        borderColor={getToken("buttons.secondary.low.onOutline")}
        borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
        align={[null, "center"]}
        direction={["column", "row"]}
        gap={[20, null]}
      >
        <Flex direction="column" gap={20}>
          <Text
            sx={{ whiteSpace: "nowrap" }}
            fw={500}
            fs={16}
            lh={1.2}
            color={getToken("text.high")}
          >
            {t("staking:dashboard.available")}
          </Text>
          <Flex
            direction={["row", "column"]}
            justify={["space-between", null]}
            gap={[null, 22]}
          >
            <Flex direction="column" gap={2}>
              {isLoading ? (
                <Skeleton height={24} />
              ) : (
                <Text
                  font="primary"
                  fw={500}
                  fs={24}
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
                <Text fs={14} lh={1.4} color={getToken("text.onTint")}>
                  ≈{claimableDisplay}
                </Text>
              )}
            </Flex>
            <Flex direction="column" gap={2}>
              <Text
                font="primary"
                fw={500}
                fs={24}
                lh={1}
                color={getToken("text.high")}
              >
                {t("percent", { value: allocatedRewardsPercentage })}
              </Text>
              {isLoading ? (
                <Skeleton height={20} />
              ) : (
                <Text fs={14} lh={1.4} color={getToken("text.onTint")}>
                  {t("staking:dashboard.ofAllocated")}
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        <RewardsCurve />
      </Flex>
      <Flex
        sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        px={getTokenPx("containers.paddings.primary")}
        py={getTokenPx("containers.paddings.tertiary")}
        bg={getToken("accents.info.primary")}
        borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
        align="center"
        justify="space-between"
      >
        <ClaimStakingRemainder
          sx={{ fontSize: 14, color: getToken("text.high") }}
          unclaimable={unclaimableRewards}
        />
        <Button
          variant="secondary"
          disabled={Big(claimableRewards).lte(0)}
          onClick={() => setClaimModal(true)}
        >
          {t("claim")}
        </Button>
      </Flex>
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
