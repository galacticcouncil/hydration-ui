import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import { ToastMessage } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { theme } from "theme"
import { separateBalance } from "utils/balance"
import { useClaimFarmMutation } from "utils/farms/claiming"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Card } from "components/Card/Card"
import { TDeposit } from "api/deposits"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import {
  useAccountClaimableFarmValues,
  useSummarizeClaimableValues,
} from "api/farms"
import BN from "bignumber.js"

export const ClaimRewardsCard = (props: {
  depositNft?: TDeposit
  onTxClose?: () => void
}) => {
  const { t } = useTranslation()
  const {
    pool: { id, meta },
  } = usePoolData()
  const { getAssetWithFallback, isShareToken } = useAssets()
  const { account } = useAccount()

  const { data: claimableValues } = useAccountClaimableFarmValues()
  const poolClaimableValues = claimableValues?.get(
    isShareToken(meta) ? meta.poolAddress : id,
  )

  const claimableDepositValues = props.depositNft
    ? poolClaimableValues?.filter(
        (farm) => farm.depositId === props.depositNft?.id,
      )
    : poolClaimableValues

  const { total, diffRewards, claimableAssetValues } =
    useSummarizeClaimableValues(claimableDepositValues ?? [])

  const { claimableAssets, toastValue } = useMemo(() => {
    const claimableAssets = []

    for (let key in claimableAssetValues) {
      const asset = getAssetWithFallback(key)
      const balance = separateBalance(BN(claimableAssetValues[key].rewards), {
        type: "token",
      })

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

  const { claim, isLoading, confirmClaimModal } = useClaimFarmMutation(
    claimableDepositValues,
    toast,
    props.onTxClose,
    () => {},
  )

  if (!claimableAssets.length) return null

  return (
    <Card variant="primary">
      <div
        sx={{
          flex: ["column", "row"],
          justify: "space-between",
          align: "center",
          gap: 8,
          width: "100%",
          mt: 12,
        }}
      >
        <div
          sx={{ flex: "column", gap: 3, mb: [16, 0], maxWidth: ["auto", 300] }}
          css={{ alignSelf: "start" }}
        >
          <Text color="white" sx={{ mb: 7 }}>
            {t("farms.claimCard.title")}
          </Text>
          {claimableAssets.map((claimableAsset, index) => (
            <Fragment key={claimableAsset.symbol}>
              <Text
                sx={{ mb: 4, fontSize: [26, 22] }}
                css={{ wordBreak: "break-all" }}
                font="GeistMedium"
              >
                {t("farms.claimCard.claim.asset", claimableAsset)}
              </Text>
              {index < claimableAssets.length - 1 && (
                <Separator color="white" opacity={0.06} />
              )}
            </Fragment>
          ))}
          <Text
            fs={14}
            sx={{ mt: 6 }}
            css={{ color: `rgba(${theme.rgbColors.white}, 0.6)` }}
          >
            <Trans t={t} i18nKey="farms.claimCard.claim.usd">
              <DisplayValue value={BN(total)} />
            </Trans>
          </Text>

          <Text
            fs={14}
            sx={{ py: 8, mt: 8, mb: 10 }}
            fw={300}
            css={{
              borderTop: `1px solid rgba(${theme.rgbColors.white}, 0.06)`,
            }}
          >
            <Trans t={t} i18nKey="farms.claimCard.claim.diffRewards">
              <DisplayValue value={BN(diffRewards)} />
            </Trans>
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          sx={{ height: "fit-content", width: ["100%", 275] }}
          disabled={account?.isExternalWalletConnected || BN(total).isZero()}
          onClick={claim}
          isLoading={isLoading}
        >
          {t("farms.claimCard.button.label")}
        </Button>
      </div>
      {confirmClaimModal}
    </Card>
  )
}
