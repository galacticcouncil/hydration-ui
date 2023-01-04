import { Button } from "components/Button/Button"
import { SContainer } from "./PoolFooter.styled"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { BN_NAN } from "utils/constants"

export const PoolFooter = () => {
  const { t } = useTranslation()

  const { locked, claimable } = {
    locked: BN_NAN,
    claimable: BN_NAN,
  } // TODO

  return (
    <SContainer>
      <div>
        <Text fs={16}>{t("liquidity.asset.claim.total", { locked })}</Text>
      </div>
      <div sx={{ flex: "row", justify: "center" }}>
        {!claimable.isNaN() && !claimable.isZero() && (
          <Text fs={16} tAlign="center">
            {t("liquidity.asset.claim.claimable", { claimable })}
          </Text>
        )}
      </div>
      <div sx={{ flex: "row", justify: "end" }}>
        {!claimable.isNaN() && !claimable?.isZero() && (
          <Button
            variant="primary"
            size="small"
            sx={{ p: "14px 44px", fontSize: 13 }}
            // isLoading={claimAll.isLoading}
            // onClick={() => claimAll.mutate()}
          >
            <WalletIcon />
            {t("liquidity.asset.claim.button")}
          </Button>
        )}
      </div>
    </SContainer>
  )
}
