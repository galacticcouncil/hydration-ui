import { ComponentProps, useState } from "react"
import { RemoveLiquidityModal } from "./RemoveLiquidityModal"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { SButton } from "sections/pools/pool/positions/LiquidityPosition.styled"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"

type Props = Pick<
  ComponentProps<typeof RemoveLiquidityModal>,
  "assets" | "onSuccess" | "position"
>

export const RemoveLiquidityButton = (props: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [openRemove, setOpenRemove] = useState(false)

  return (
    <>
      <SButton
        variant="secondary"
        size="small"
        onClick={() => setOpenRemove(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </SButton>
      {openRemove && (
        <RemoveLiquidityModal
          {...props}
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
        />
      )}
    </>
  )
}
