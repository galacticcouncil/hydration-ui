import { Trans, useTranslation } from "react-i18next"
import { useAPR } from "utils/apr"
import { useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { useDeposits } from "api/deposits"
import { useBestNumber } from "api/chain"
import { useMath } from "utils/math"
import { BN_0, BN_1 } from "utils/constants"
import BN from "bignumber.js"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { css } from "styled-components"
import { theme } from "theme"
import { useAUSD } from "api/asset"
import { useSpotPrices } from "api/spotPrice"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/network"
import { useMutation } from "@tanstack/react-query"
import { useStore } from "state/store"
import { SContainer } from "./PoolJoinFarmClaim.styled"
import { getFormatSeparators } from "utils/formatting"

export function PoolJoinFarmClaim(props: { poolId: string }) {
  const { t, i18n } = useTranslation()
  const math = useMath()
  const bestNumber = useBestNumber()
  const apr = useAPR(props.poolId)

  // TODO: filter only deposits created by user
  const deposits = useDeposits(props.poolId)

  const ausd = useAUSD()
  const currencies = [
    ...new Set(apr.data.map((i) => i.globalFarm.rewardCurrency.toString())),
  ]

  const bsxSpotPrices = useSpotPrices(currencies, NATIVE_ASSET_ID)
  const ausdSpotPrices = useSpotPrices(currencies, ausd.data?.token)

  const rewards = useMemo(() => {
    if (bestNumber.data == null) return null

    return deposits.data
      ?.map((record) => {
        return record.deposit.yieldFarmEntries.map((entry) => {
          const aprEntry = apr.data.find(
            (i) =>
              i.globalFarm.id.eq(entry.globalFarmId) &&
              i.yieldFarm.id.eq(entry.yieldFarmId),
          )

          const bsx = bsxSpotPrices.find((a) =>
            aprEntry?.globalFarm.rewardCurrency.eq(a.data?.tokenIn),
          )?.data

          const ausd = ausdSpotPrices.find((a) =>
            aprEntry?.globalFarm.rewardCurrency.eq(a.data?.tokenIn),
          )?.data

          if (
            aprEntry == null ||
            bsx == null ||
            ausd == null ||
            math.liquidityMining == null
          )
            return null

          const currentPeriod = bestNumber.data
            .toBigNumber()
            .dividedToIntegerBy(
              aprEntry.globalFarm.blocksPerPeriod.toBigNumber(),
            )
          const periods = currentPeriod.minus(entry.enteredAt.toBigNumber())

          let loyaltyMultiplier = BN_1.toString()

          if (!aprEntry.yieldFarm.loyaltyCurve.isNone) {
            const { initialRewardPercentage, scaleCoef } =
              aprEntry.yieldFarm.loyaltyCurve.unwrap()

            loyaltyMultiplier =
              math.liquidityMining.calculate_loyalty_multiplier(
                periods.toFixed(),
                initialRewardPercentage.toBigNumber().toFixed(),
                scaleCoef.toBigNumber().toFixed(),
              )
          }

          const reward = new BN(
            math.liquidityMining.calculate_user_reward(
              entry.accumulatedRpvs.toBigNumber().toFixed(),
              entry.valuedShares.toBigNumber().toFixed(),
              entry.accumulatedClaimedRewards.toBigNumber().toFixed(),
              aprEntry.yieldFarm.accumulatedRpvs.toBigNumber().toFixed(),
              loyaltyMultiplier,
            ),
          )

          // bsx reward
          const bsxReward = reward.multipliedBy(bsx.spotPrice)
          const ausdReward = reward.multipliedBy(ausd.spotPrice)

          return { ausd: ausdReward, bsx: bsxReward }
        })
      })
      .flat(2)
      .reduce<{ bsx: BN; ausd: BN }>(
        (memo, item) => ({
          ausd: memo.ausd.plus(item?.ausd ?? BN_0),
          bsx: memo.bsx.plus(item?.bsx ?? BN_0),
        }),
        { bsx: BN_0, ausd: BN_0 },
      )
  }, [
    apr.data,
    ausdSpotPrices,
    bestNumber.data,
    bsxSpotPrices,
    deposits.data,
    math.liquidityMining,
  ])

  const separators = getFormatSeparators(i18n.languages[0])
  const [num, denom] = t("value", {
    value: rewards?.bsx,
    fixedPointScale: 12,
    numberPrefix: "≈",
    decimalPlaces: 4,
  }).split(separators.decimal ?? ".")

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const claimMutation = useMutation(async () => {
    const txs =
      deposits.data
        ?.map((i) =>
          i.deposit.yieldFarmEntries.map((entry) => {
            return api.tx.liquidityMining.claimRewards(i.id, entry.yieldFarmId)
          }),
        )
        .flat(2) ?? []

    if (txs.length) {
      return await createTransaction({
        tx: api.tx.utility.batch(txs),
      })
    }
  })

  return (
    <SContainer flex>
      <Box
        css={css`
          flex-shrink: 1;
        `}
      >
        <Text color="primary200" fs={16} mb={6}>
          {t("pools.allFarms.modal.claim.title")}
        </Text>
        <Text
          fw={900}
          fs={28}
          mb={4}
          css={css`
            word-break: break-all;
          `}
        >
          <Trans
            t={t}
            i18nKey="pools.allFarms.modal.claim.bsx"
            tOptions={{ num, denom }}
          >
            <span
              css={css`
                color: rgba(${theme.rgbColors.white}, 0.4);
                font-size: 18px;
              `}
            />
          </Trans>
        </Text>
        <Text
          css={css`
            color: rgba(255, 255, 255, 0.4);
            word-break: break-all;
          `}
        >
          {t("value.usd", { amount: rewards?.ausd })}
        </Text>
      </Box>
      <Button
        variant="primary"
        ml={32}
        css={css`
          flex-shrink: 0;
        `}
        disabled={!!rewards?.bsx.isZero()}
        isLoading={claimMutation.isLoading}
        onClick={() => claimMutation.mutate()}
      >
        {t("pools.allFarms.modal.claim.submit")}
      </Button>
    </SContainer>
  )
}
