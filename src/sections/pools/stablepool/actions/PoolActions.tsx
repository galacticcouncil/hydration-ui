import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SActionsContainer } from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"
import { TransferModal } from "../transfer/TransferModal"
import { u32 } from "@polkadot/types-codec"

type PoolActionsProps = {
  poolId: u32
  className?: string
}
export const PoolActions = ({ poolId, className }: PoolActionsProps) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccountStore()

  const actionButtons = (
    <div sx={{ flexGrow: 1 }}>
      <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
        <Button
          fullWidth
          size="small"
          disabled={!account || account.isExternalWalletConnected}
          onClick={() => setOpenAdd(true)}
        >
          <div sx={{ flex: "row", align: "center", justify: "center" }}>
            <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
            {t("liquidity.asset.actions.addLiquidity")}
          </div>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <SActionsContainer className={className}>
        {actionButtons}
      </SActionsContainer>
      {openAdd && (
        <TransferModal
          isOpen={true}
          onClose={() => setOpenAdd(false)}
          poolId={poolId}
        />
      )}
    </>
  )
}
