import { SContainer } from "./PoolFooter.styled"
import { Trans, useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useFooterValues } from "sections/pools/pool/footer/PoolFooter.utils"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import Skeleton from "react-loading-skeleton"
import { useClaimAllMutation, useClaimableAmount } from "utils/farms/claiming"
import { Button } from "components/Button/Button"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { getFloatingPointAmount } from "utils/balance"

type Props = { pool: OmnipoolPool }

export const PoolFooter = ({ pool }: Props) => {
  const { t } = useTranslation()

  const claimable = useClaimableAmount(pool)
  const footerValues = useFooterValues(pool)

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
          suffixPrefix: "$",
          fixedPointScale: 12,
        })}
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
          ) : (
            t("liquidity.asset.claim.farmTotal", {
              locked: footerValues.locked,
              available: footerValues.available,
            })
          )}
        </Text>
      </div>
      {claimable.data?.usd && !claimable.data?.usd.isZero() && (
        <>
          <div sx={{ flex: "row", justify: "center" }}>
            <Text fw={600} lh={22} tAlign="center">
              {import.meta.env.VITE_FF_FORMAT_CLAIMABLE_VALUE === "true" &&
              getFloatingPointAmount(claimable.data?.usd ?? 0, 12).lt(0.01)
                ? t("farms.claimCard.smallValue")
                : t("liquidity.asset.claim.claimable", {
                    claimable: claimable.data?.usd,
                    fixedPointScale: 12,
                  })}
            </Text>
          </div>
          <div sx={{ flex: "row", justify: "end" }}>
            <Button
              variant="primary"
              size="small"
              sx={{ p: "12px 21px" }}
              isLoading={claimAll.isLoading}
              disabled={claimable.data.usd.isZero()}
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
