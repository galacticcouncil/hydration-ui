import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useFooterValues } from "sections/pools/pool/footer/PoolFooter.utils"
import { ToastMessage, useAccountStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { useClaimAllMutation, useClaimableAmount } from "utils/farms/claiming"
import { SContainer } from "./PoolFooter.styled"

type Props = { pool: OmnipoolPool }

export const PoolFooter = ({ pool }: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const claimable = useClaimableAmount(pool.id)
  const footerValues = useFooterValues(pool)

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

  const claimAll = useClaimAllMutation(pool.id, undefined, toast)

  if (!footerValues.locked || footerValues.locked.isZero()) return null

  return (
    <SContainer>
      <div>
        <Text>
          {footerValues.isLoading ? (
            <Skeleton />
          ) : footerValues.farming.isZero() ? (
            <Trans t={t} i18nKey="liquidity.asset.claim.total">
              <DisplayValue value={footerValues.locked} />
            </Trans>
          ) : (
            <Trans t={t} i18nKey="liquidity.asset.claim.farmTotal">
              <DisplayValue value={footerValues.locked} />
              <DisplayValue value={footerValues.farming} />
            </Trans>
          )}
        </Text>
      </div>
      {claimable.data?.displayValue &&
        !claimable.data?.displayValue.isZero() && (
          <>
            <div sx={{ flex: "row", justify: "center" }}>
              <Text fw={600} lh={22} tAlign="center">
                {import.meta.env.VITE_FF_FORMAT_CLAIMABLE_VALUE === "true" &&
                (claimable.data?.displayValue ?? 0).lt(0.01) ? (
                  t("farms.claimCard.smallValue")
                ) : (
                  <Trans t={t} i18nKey="liquidity.asset.claim.claimable">
                    <DisplayValue value={claimable.data?.displayValue} />
                  </Trans>
                )}
              </Text>
            </div>
            <div sx={{ flex: "row", justify: "end" }}>
              <Button
                variant="primary"
                size="small"
                sx={{ p: "12px 21px" }}
                isLoading={claimAll.isLoading}
                disabled={
                  claimable.data.displayValue.isZero() ||
                  account?.isExternalWalletConnected
                }
                onClick={() => claimAll.mutate()}
              >
                <WalletIcon />
                {t("farms.claimCard.button.label")}
              </Button>
            </div>
          </>
        )}
    </SContainer>
  )
}
