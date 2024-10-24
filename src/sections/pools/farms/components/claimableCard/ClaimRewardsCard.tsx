import { css } from "@emotion/react"
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

  const { total, claimableAssetValues } = useSummarizeClaimableValues(
    claimableDepositValues ?? [],
  )

  const { claimableAssets, toastValue } = useMemo(() => {
    const claimableAssets = []

    for (let key in claimableAssetValues) {
      const asset = getAssetWithFallback(key)
      const balance = separateBalance(BN(claimableAssetValues[key]), {
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

  const claimAll = useClaimFarmMutation(
    id,
    props.depositNft,
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
          width: "100%",
          mt: 12,
        }}
      >
        <div
          sx={{ flex: "column", gap: 3, mb: [16, 0] }}
          css={{ alignSelf: "start" }}
        >
          <Text color="white" sx={{ mb: 7 }}>
            {t("farms.claimCard.title")}
          </Text>
          {claimableAssets.map((claimableAsset) => (
            <Fragment key={claimableAsset.symbol}>
              <Text
                sx={{ mb: 4, fontSize: [26, 19] }}
                css={{ wordBreak: "break-all" }}
              >
                <Trans
                  t={t}
                  i18nKey={"farms.claimCard.claim.asset"}
                  tOptions={claimableAsset ?? {}}
                >
                  <span
                    css={css`
                      color: rgba(${theme.rgbColors.white}, 0.4);
                      font-size: 18px;
                    `}
                  />
                </Trans>
              </Text>
              <Separator color="white" opacity={0.06} />
            </Fragment>
          ))}
          <Text
            sx={{ mt: 6 }}
            css={{ color: `rgba(${theme.rgbColors.white}, 0.4)` }}
          >
            <Trans t={t} i18nKey="farms.claimCard.claim.usd">
              <DisplayValue value={total} />
            </Trans>
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          sx={{ height: "fit-content", width: ["100%", 275] }}
          disabled={
            account?.isExternalWalletConnected || (total && total.isZero())
          }
          onClick={() => claimAll.mutate()}
          isLoading={claimAll.isLoading}
        >
          {t("farms.claimCard.button.label")}
        </Button>
      </div>
    </Card>
  )
}
