import * as Tooltip from "@radix-ui/react-tooltip"
import { SClaimAllButton, SContent } from "./ClaimAllDrowpdown.styled"
import { Trans, useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useClaimAllMutation, useClaimableAmount } from "utils/farms/claiming"
import { useMemo } from "react"
import { useAssetMetaList } from "api/assetMeta"
import { theme } from "theme"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage, useAccountStore } from "state/store"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"

export const ClaimAllDropdown = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const claimable = useClaimableAmount()

  const assetsMeta = useAssetMetaList(Object.keys(claimable.data?.assets || {}))

  const { claimableAssets } = useMemo(() => {
    const claimableAssets = []

    if (assetsMeta.data) {
      for (let key in claimable.data?.assets) {
        const asset = assetsMeta.data?.find((meta) => meta.id === key)

        claimableAssets.push({
          value: claimable.data?.assets[key],
          symbol: asset?.symbol,
          decimals: asset?.decimals ?? 12,
        })
      }
    }

    return { claimableAssets }
  }, [assetsMeta.data, claimable.data?.assets])

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <>
        <Trans i18nKey={`farms.claimCard.toast.${msType}`}>
          <span />
        </Trans>
        {t("value", {
          value: claimable.data?.usd,
          type: "token",
          numberPrefix: "$",
          fixedPointScale: 12,
        })}
      </>
    )
    return memo
  }, {} as ToastMessage)

  const claimAll = useClaimAllMutation(undefined, undefined, toast)

  return (
    <Tooltip.Root delayDuration={0}>
      <SClaimAllButton
        disabled={
          !claimable.data ||
          claimable.data.usd.isZero() ||
          account?.isExternalWalletConnected
        }
        onClick={() => claimAll.mutate()}
      >
        <WalletIcon />
        <Text fs={13} tTransform="uppercase">
          {t("farms.claimCard.button.label")}
        </Text>
      </SClaimAllButton>
      <Tooltip.Portal>
        <Tooltip.Content asChild side="bottom" align="end" sideOffset={-2}>
          <SContent
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            transition={{
              type: "spring",
              mass: 1,
              stiffness: 300,
              damping: 20,
              duration: 0.3,
            }}
            css={{ overflow: "hidden" }}
          >
            <div sx={{ p: 40 }}>
              <Text>{t("farms.claimCard.title")}</Text>
              <Spacer size={16} />
              {claimableAssets.map((claimableAsset, index) => (
                <div key={claimableAsset.symbol} sx={{ mt: 8 }}>
                  <Text fs={19} lh={19} font="FontOver" sx={{ mb: 8 }}>
                    {t("value.tokenWithSymbol", {
                      value: claimableAsset.value,
                      fixedPointScale: claimableAsset.decimals,
                      symbol: claimableAsset.symbol,
                    })}
                  </Text>
                  {index < claimableAssets.length - 1 && (
                    <Separator
                      css={{
                        background: `rgba(${theme.rgbColors.white}, 0.06)`,
                      }}
                    />
                  )}
                </div>
              ))}
              <Text
                fs={14}
                sx={{ mt: 6 }}
                css={{ color: `rgba(${theme.rgbColors.white}, 0.4)` }}
              >
                {t("farms.claimCard.claim.usd", {
                  value: claimable.data?.usd,
                  numberPrefix: "$",
                  fixedPointScale: 12,
                })}
              </Text>
            </div>
          </SContent>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
