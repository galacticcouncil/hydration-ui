import {
  Box,
  Flex,
  LoadingButton,
  SValueStatsValue,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { type RewardsDistributorClaim } from "@/api/rewardsDistributor"
import { useClaimDistributorRewards } from "@/modules/borrow/dashboard/components/DistributorRewards.tx"

type DistributorRewardsProps = {
  claim: RewardsDistributorClaim
}

export const DistributorRewards: FC<DistributorRewardsProps> = ({ claim }) => {
  const { t } = useTranslation(["common", "borrow"])
  const { status, symbol, owed } = claim
  const { mutate, isPending } = useClaimDistributorRewards(symbol)

  const blockedReason =
    status === "belowDeposit"
      ? t("borrow:distributorRewards.belowDeposit", { symbol })
      : status === "underfunded"
        ? t("borrow:distributorRewards.underfunded")
        : undefined

  return (
    <ValueStats
      label={t("borrow:distributorRewards.label", { symbol })}
      wrap={[false, false, true]}
      customValue={
        <SValueStatsValue size="large">
          <Flex align="center" gap="base">
            {t("currency", { value: owed, symbol })}
            <Tooltip text={blockedReason} asChild>
              {/* a disabled button fires no pointer events of its own */}
              <Box as="span">
                <LoadingButton
                  isLoading={isPending}
                  disabled={status !== "claimable"}
                  onClick={() => mutate()}
                >
                  {t("borrow:claim")}
                </LoadingButton>
              </Box>
            </Tooltip>
          </Flex>
        </SValueStatsValue>
      }
    />
  )
}
