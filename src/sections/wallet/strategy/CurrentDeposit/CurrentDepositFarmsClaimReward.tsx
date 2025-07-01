import {
  useAccountClaimableFarmValues,
  useSummarizeClaimableValues,
} from "api/farms"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import BN from "bignumber.js"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useMemo } from "react"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { separateBalance } from "utils/balance"
import { useAssets } from "providers/assets"
import { useClaimFarmMutation } from "utils/farms/claiming"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import Skeleton from "react-loading-skeleton"

export const CurrentDepositFarmsClaimReward = ({
  assetId,
}: {
  assetId: string
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { data: claimableValues, isLoading: isFarmValuesLoading } =
    useAccountClaimableFarmValues()
  const poolClaimableValues = claimableValues?.get(assetId)

  const { claimableTotal, claimableAssetValues, isLoading } =
    useSummarizeClaimableValues(poolClaimableValues ?? [])

  const { claimableAssets, toastValue } = useMemo(() => {
    const claimableAssets = []

    for (let key in claimableAssetValues) {
      const asset = getAssetWithFallback(key)
      const balance = separateBalance(
        BN(claimableAssetValues[key].claimableRewards),
        {
          type: "token",
        },
      )

      claimableAssets.push({ ...balance, symbol: asset?.symbol })
    }

    const toastValue = claimableAssets.map((asset, index) => {
      return (
        <Fragment key={index}>
          {index > 0 && <span> {t("and")} </span>}
          <Trans t={t} i18nKey="farms.claimCard.toast.asset" tOptions={asset}>
            <span />
            <span className="highlight" />
          </Trans>
        </Fragment>
      )
    })

    return { claimableAssets, toastValue }
  }, [getAssetWithFallback, claimableAssetValues, t])

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <>
        <Trans i18nKey={`farms.claimCard.toast.${msType}`}>
          <span />
        </Trans>
        {toastValue}
      </>
    )
    return memo
  }, {} as ToastMessage)

  const { claim } = useClaimFarmMutation(
    poolClaimableValues,
    toast,
    () => {},
    () => {},
  )

  return (
    <>
      <div sx={{ flex: "column", gap: 8 }}>
        <Text fw={500} fs={14} lh="1" color="brightBlue300">
          {t("wallet.strategy.deposit.myRewards")}
        </Text>
        {isLoading || isFarmValuesLoading ? (
          <Skeleton width={50} height={16} />
        ) : claimableAssets.length ? (
          claimableAssets.map((claimableAsset) => (
            <Fragment key={claimableAsset.symbol}>
              <Text fw={500} fs={18} lh={13} color="white">
                {t("farms.claimCard.claim.asset", claimableAsset)}
              </Text>
            </Fragment>
          ))
        ) : (
          <Text fw={500} fs={18} lh={13} color="white">
            {t("value", { value: 0 })}
          </Text>
        )}
        <Text fw={500} fs={11} lh="1.4" color="basic100">
          <DisplayValue value={BN(claimableTotal)} />
        </Text>
      </div>

      <Button
        variant="primary"
        size="small"
        disabled={BN(claimableTotal).lte(0)}
        onClick={() => claim()}
      >
        {t("claim")}
      </Button>
    </>
  )
}
