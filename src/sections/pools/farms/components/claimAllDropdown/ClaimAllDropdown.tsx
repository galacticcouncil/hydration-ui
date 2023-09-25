import * as Tooltip from "@radix-ui/react-tooltip"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { HeaderSeparator } from "sections/pools/header/PoolsHeader"
import { ToastMessage, useAccountStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { theme } from "theme"
import { useClaimAllMutation, useClaimableAmount } from "utils/farms/claiming"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useRpcProvider } from "providers/rpcProvider"
import {
  SClaimButton,
  SContent,
  STriggerButton,
} from "./ClaimAllDrowpdown.styled"

export const ClaimAllDropdown = () => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()

  const [open, setOpen] = useState(false)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const claimable = useClaimableAmount()

  const { claimableAssets } = useMemo(() => {
    const claimableAssets = []

    for (let key in claimable.data?.assets) {
      const asset = assets.getAsset(key)

      claimableAssets.push({
        value: claimable.data?.assets[key],
        symbol: asset.symbol,
        decimals: asset.decimals,
      })
    }

    return { claimableAssets }
  }, [assets, claimable.data?.assets])

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <>
        <Trans i18nKey={`farms.claimCard.toast.${msType}`}>
          <span />
        </Trans>
        <DisplayValue value={claimable.data?.displayValue} type="token" />
      </>
    )
    return memo
  }, {} as ToastMessage)

  const claimAll = useClaimAllMutation(undefined, undefined, toast)

  const depositShares = useAllUserDepositShare()

  if (!Object.keys(depositShares.data).length) return null

  const claimAllBox = (
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
      <div sx={{ p: 40, flex: "column" }}>
        <Text>{t("farms.claimCard.title")}</Text>
        <Spacer size={16} />
        {claimableAssets.map((claimableAsset, index) => (
          <div key={claimableAsset.symbol} sx={{ mt: 8 }}>
            <Text fs={19} lh={19} font="FontOver" sx={{ mb: 8 }}>
              {t("value.tokenWithSymbol", {
                value: claimableAsset.value,
                fixedPointScale: claimableAsset.decimals.toString(),
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
        <Text fs={14} sx={{ mt: 6 }}>
          <Trans t={t} i18nKey="farms.claimCard.claim.usd">
            <DisplayValue value={claimable.data?.displayValue} />
          </Trans>
        </Text>
        <Spacer size={18} />
        <SClaimButton
          disabled={
            !claimable.data ||
            claimable.data.displayValue.isZero() ||
            account?.isExternalWalletConnected
          }
          onClick={() => {
            claimAll.mutate()
            setOpen(false)
          }}
        >
          <Text fs={13} tTransform="uppercase" tAlign="center">
            {t("farms.claimCard.button.label")}
          </Text>
        </SClaimButton>
      </div>
    </SContent>
  )

  return (
    <>
      <HeaderSeparator />
      <div sx={{ flex: "row" }} css={{ textAlign: "right" }}>
        <Tooltip.Root
          delayDuration={0}
          open={open}
          onOpenChange={(open) => {
            isDesktop && setOpen(open)
          }}
        >
          <div sx={{ flex: "column", flexGrow: [1, 0] }}>
            <STriggerButton
              onMouseOver={() => setOpen(true)}
              onClick={() => !isDesktop && setOpen(!open)}
            >
              <Text
                fs={13}
                lh={13}
                tTransform="uppercase"
                css={{ whiteSpace: "nowrap" }}
              >
                {t("farms.header.dropdown.label")}
              </Text>
              <Icon
                size={18}
                icon={
                  <ChevronRight
                    css={{ transform: `rotate(${open ? "270" : "90"}deg)` }}
                  />
                }
              />
            </STriggerButton>
            {open && !isDesktop && claimAllBox}
          </div>
          <Tooltip.Portal>
            <Tooltip.Content asChild side="bottom" align="end" sideOffset={-2}>
              {isDesktop && claimAllBox}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </>
  )
}
