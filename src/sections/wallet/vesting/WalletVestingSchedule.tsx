import { SClaimButton, SInner, SSchedule } from "./WalletVestingSchedule.styled"
import { useCallback, useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { css } from "@emotion/react"
import { theme } from "theme"
import { Heading } from "components/Typography/Heading/Heading"
import {
  useNextClaimableDate,
  useVestingTotalClaimableBalance,
} from "api/vesting"
import { useSpotPrice } from "api/spotPrice"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useExistentialDeposit, useTokenBalance } from "api/balances"
import { ToastMessage, useAccountStore, useStore } from "state/store"
import { usePaymentInfo } from "api/transaction"
import { separateBalance } from "utils/balance"
import { useAssetMeta } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { TOAST_MESSAGES } from "state/toasts"

export const WalletVestingSchedule = () => {
  const { t } = useTranslation()
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()
  const { data: claimableBalance } = useVestingTotalClaimableBalance()

  const { data: nextClaimableDate } = useNextClaimableDate()
  const { data: paymentInfoData } = usePaymentInfo(api.tx.vesting.claim())
  const { data: existentialDeposit } = useExistentialDeposit()
  const { data: meta } = useAssetMeta(NATIVE_ASSET_ID)

  const apiIds = useApiIds()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, apiIds.data?.stableCoinId)
  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const claimableUSD = useMemo(() => {
    if (claimableBalance && spotPrice.data) {
      return claimableBalance.times(spotPrice.data.spotPrice)
    }
    return null
  }, [claimableBalance, spotPrice])

  const isClaimAllowed = useMemo(() => {
    if (paymentInfoData && existentialDeposit && claimableBalance) {
      return claimableBalance.isGreaterThan(
        existentialDeposit.plus(paymentInfoData.partialFee.toBigNumber()),
      )
    }

    return false
  }, [paymentInfoData, existentialDeposit, claimableBalance])

  const handleClaim = useCallback(async () => {
    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`wallet.vesting.toast.${msType}`}
          tOptions={{
            amount: claimableBalance,
            fixedPointScale: meta?.decimals.toNumber() ?? 12,
            symbol: meta?.symbol,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    return !!account?.delegate
      ? await createTransaction(
          {
            tx: api.tx.proxy.proxy(
              account?.address,
              null,
              api.tx.vesting.claimFor(account?.address),
            ),
          },
          { isProxy: true, toast },
        )
      : await createTransaction(
          {
            tx: api.tx.vesting.claim(),
          },
          { toast },
        )
  }, [api, account, createTransaction, claimableBalance, meta, t])

  return (
    <SSchedule>
      <SInner>
        <div
          sx={{
            flex: "column",
            gap: 6,
          }}
        >
          <Text color="brightBlue200" fs={[14, 16]} fw={500}>
            {t("wallet.vesting.claimable_now")}
          </Text>
          <Heading as="h3" font="FontOver" sx={{ fontSize: [28, 34] }}>
            <Trans
              t={t}
              i18nKey="wallet.vesting.claimable_now_value"
              tOptions={{
                ...separateBalance(claimableBalance, {
                  fixedPointScale: meta?.decimals.toNumber() ?? 12,
                  type: "token",
                }),
                symbol: meta?.symbol,
              }}
            >
              <span
                sx={{ fontSize: [14, 21] }}
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                `}
              />
            </Trans>
          </Heading>
          <Text
            fs={[14, 16]}
            lh={18}
            css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }}
          >
            {t("value.usd", {
              amount: claimableUSD,
              fixedPointScale: meta?.decimals.toNumber() ?? 12,
            })}
          </Text>
        </div>
        <div
          sx={{
            textAlign: "center",
            mt: [24, 0],
            width: ["100%", "auto"],
          }}
        >
          {balance.data && claimableBalance && (
            <SClaimButton
              variant="gradient"
              transform="uppercase"
              onClick={handleClaim}
              disabled={
                !isClaimAllowed ||
                (account?.isExternalWalletConnected && !account?.delegate)
              }
            >
              {t("wallet.vesting.claim_assets")}
            </SClaimButton>
          )}
          {nextClaimableDate && (
            <Text
              color="basic300"
              tAlign="center"
              sx={{
                mt: 15,
                display: ["none", "inherit"],
              }}
            >
              {t("wallet.vesting.estimated_claim_date", {
                date: nextClaimableDate,
              })}
            </Text>
          )}
        </div>
      </SInner>
    </SSchedule>
  )
}
