import { css } from "@emotion/react"
import { DepositNftType } from "api/deposits"
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
import { useClaimAllMutation, useClaimableAmount } from "utils/farms/claiming"
import { SContainer } from "./ClaimRewardsCard.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { u32 } from "@polkadot/types-codec"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const ClaimRewardsCard = (props: {
  poolId: u32
  depositNft?: DepositNftType
  onTxClose?: () => void
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccount()

  const claimable = useClaimableAmount(props.poolId, props.depositNft)

  const { claimableAssets, toastValue } = useMemo(() => {
    const claimableAssets = []

    for (let key in claimable.data?.assets) {
      const asset = assets.getAsset(key)
      const balance = separateBalance(claimable.data?.assets[key], {
        fixedPointScale: asset.decimals,
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
  }, [assets, claimable.data?.assets, t])

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

  const claimAll = useClaimAllMutation(
    props.poolId,
    props.depositNft,
    toast,
    props.onTxClose,
    () => {},
  )

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
          <Trans t={t} i18nKey="farms.claimCard.claim.usd">
            <DisplayValue value={claimable.data?.displayValue} />
          </Trans>
        </Text>
      </div>
      <Button
        variant="primary"
        sx={{ height: "fit-content", width: ["100%", 168] }}
        disabled={
          account?.isExternalWalletConnected ||
          (claimable.data && claimable.data.displayValue.isZero())
        }
        onClick={() => claimAll.mutate()}
        isLoading={claimAll.isLoading}
      >
        {t("farms.claimCard.button.label")}
      </Button>
    </SContainer>
  )
}
