import { Text } from "components/Typography/Text/Text"
import { ReactComponent as RewardIcon } from "assets/icons/StakingRewardIcon.svg"

import {
  SRewardCardContainer,
  SRewartCardHeader,
} from "./AvailableRewards.styled"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Trans, useTranslation } from "react-i18next"
import { useDisplayPrice } from "utils/displayAsset"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import Skeleton from "react-loading-skeleton"
import { useClaimReward } from "sections/staking/StakingPage.utils"
import { ToastMessage, useAccountStore, useStore } from "state/store"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { TOAST_MESSAGES } from "state/toasts"
import { DECIMAL_PLACES } from "@galacticcouncil/sdk"

export const AvailableRewards = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const reward = useClaimReward()
  const spotPrice = useDisplayPrice(NATIVE_ASSET_ID)

  const api = useApiPromise()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  const isLoading = !reward.data || spotPrice.isLoading

  const onClaimRewards = async () => {
    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`staking.toasts.claim.${msType}`}
          tOptions={{
            value: reward.data?.rewards,
            fixedPointScale: DECIMAL_PLACES,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    await createTransaction(
      {
        tx: api.tx.staking.claim(reward.data?.positionId),
      },
      { toast },
    )

    await queryClient.invalidateQueries(QUERY_KEYS.stake(account?.address))
    await queryClient.invalidateQueries(
      QUERY_KEYS.tokenBalance(NATIVE_ASSET_ID, account?.address),
    )
  }

  return (
    <SRewardCardContainer>
      <SRewartCardHeader>
        <Icon sx={{ color: "pink600" }} icon={<RewardIcon />} />
        <Text
          fs={15}
          lh={15}
          sx={{ pt: 5 }}
          color="white"
          font="FontOver"
          tTransform="uppercase"
        >
          {t("staking.dashboard.rewards.title")}
        </Text>
      </SRewartCardHeader>
      <div sx={{ p: "28px 25px", flex: ["column", "row"], gap: 12 }}>
        <div sx={{ flex: "column", justify: "space-around" }}>
          {isLoading || !reward.data ? (
            <Skeleton width={90} height={25} />
          ) : (
            <Text
              fs={24}
              color="white"
              font="FontOver"
              tTransform="uppercase"
              css={{ whiteSpace: "nowrap" }}
            >
              {t("value.tokenWithSymbol", {
                value: reward.data.rewards,
                symbol: "HDX",
              })}
            </Text>
          )}
          {isLoading || !reward.data ? (
            <Skeleton width={60} height={16} />
          ) : (
            <Text fs={14} css={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <DisplayValue
                value={reward.data.rewards.multipliedBy(
                  spotPrice.data?.spotPrice ?? 1,
                )}
              />
            </Text>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={!reward.data || reward.data.rewards.isZero()}
          onClick={onClaimRewards}
        >
          {t("staking.dashboard.rewards.button")}
        </Button>
      </div>
    </SRewardCardContainer>
  )
}
