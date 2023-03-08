import { Trans, useTranslation } from "react-i18next"
import { SContainer } from "./ClaimRewardsCard.styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { Button } from "components/Button/Button"
import { Fragment, useMemo } from "react"
import { css } from "@emotion/react"
import { Separator } from "components/Separator/Separator"
import { useAssetMetaList } from "api/assetMeta"
import { separateBalance } from "utils/balance"
import { useClaimableAmount, useClaimAllMutation } from "utils/farms/claiming"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { DepositNftType } from "api/deposits"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccountStore } from "state/store"

export const ClaimRewardsCard = (props: {
  pool: OmnipoolPool
  depositNft: DepositNftType
}) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const claimable = useClaimableAmount(props.pool, props.depositNft)
  const assetsMeta = useAssetMetaList(Object.keys(claimable.data?.assets || {}))

  const { claimableAssets, toastValue } = useMemo(() => {
    const claimableAssets = []

    if (assetsMeta.data) {
      for (let key in claimable.data?.assets) {
        const asset = assetsMeta.data?.find((meta) => meta.id === key)
        const balance = separateBalance(claimable.data?.assets[key], {
          fixedPointScale: asset?.decimals ?? 12,
          type: "token",
        })

        claimableAssets.push({ ...balance, symbol: asset?.symbol })
      }
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
  }, [assetsMeta.data, claimable.data?.assets, t])

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

  const claimAll = useClaimAllMutation(props.pool.id, props.depositNft, toast)

  return (
    <SContainer>
      <div
        sx={{ flex: "column", gap: 3, mb: [16, 0] }}
        css={{ alignSelf: "start" }}
      >
        <Text color="brightBlue200" sx={{ mb: 7 }}>
          {t("farms.claimCard.title")}
        </Text>
        {claimableAssets.map((claimableAsset) => (
          <Fragment key={claimableAsset.symbol}>
            <Text
              font="FontOver"
              sx={{ mb: 4, fontSize: [26, 28] }}
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
            <Separator />
          </Fragment>
        ))}
        <Text
          sx={{ mt: 6 }}
          css={{ color: `rgba(${theme.rgbColors.white}, 0.4)` }}
        >
          {t("value.usd", {
            amount: claimable.data?.usd,
            fixedPointScale: 12,
            type: "token",
          })}
        </Text>
      </div>
      <Button
        variant="primary"
        sx={{ height: "fit-content", width: ["100%", 168] }}
        disabled={account?.isExternalWalletConnected}
        onClick={() => claimAll.mutate()}
        isLoading={claimAll.isLoading}
      >
        {t("farms.claimCard.button.label")}
      </Button>
    </SContainer>
  )
}
