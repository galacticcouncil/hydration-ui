import {
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import { Modal, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { AddStablepoolLiquidityWrapper } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"
import { RemoveMoneyMarketLiquidity } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity"
import { SupplyIsolatedLiquidity } from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity"
import { actionRoute } from "@/modules/money-market-v2/actions/actionRoute"
import { BorrowForm } from "@/modules/money-market-v2/actions/BorrowForm"
import { ClaimRewardsForm } from "@/modules/money-market-v2/actions/ClaimRewardsForm"
import { CollateralForm } from "@/modules/money-market-v2/actions/CollateralForm"
import { EModeForm } from "@/modules/money-market-v2/actions/EModeForm"
import { RepayForm } from "@/modules/money-market-v2/actions/RepayForm"
import { SupplyForm } from "@/modules/money-market-v2/actions/SupplyForm"
import { useRefreshMarket } from "@/modules/money-market-v2/actions/useRefreshMarket"
import { WithdrawForm } from "@/modules/money-market-v2/actions/WithdrawForm"
import type { RowAction } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { reserveAssetId } from "@/modules/money-market-v2/reserves"
import { useResolveReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly open: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
}

/**
 * The dialog every money-market action opens in. The body does not scroll and
 * there is no footer - each form carries its own submit button, so the same
 * form also works inline on a page.
 */
export const ActionModal: FC<Props> = ({ open, onClose, title, children }) => (
  <Modal open={open} onOpenChange={(open) => !open && onClose()}>
    <ModalHeader title={title} />
    <ModalBody scrollable={false}>{children}</ModalBody>
  </Modal>
)

export type OpenAction =
  | { action: RowAction; asset: Address }
  | { action: "emode" | "claim" }

const ActionForm: FC<{ open: OpenAction; onSubmitted: () => void }> = ({
  open,
  onSubmitted,
}) => {
  switch (open.action) {
    case "supply":
      return <SupplyForm asset={open.asset} onSubmitted={onSubmitted} />
    case "withdraw":
      return <WithdrawForm asset={open.asset} onSubmitted={onSubmitted} />
    case "borrow":
      return <BorrowForm asset={open.asset} onSubmitted={onSubmitted} />
    case "repay":
      return <RepayForm asset={open.asset} onSubmitted={onSubmitted} />
    case "collateral":
      return <CollateralForm asset={open.asset} onSubmitted={onSubmitted} />
    case "emode":
      return <EModeForm onSubmitted={onSubmitted} />
    case "claim":
      return <ClaimRewardsForm onSubmitted={onSubmitted} />
  }
}

/**
 * The modal for whichever action is open, if any. Swap-in supply and
 * pool-share withdraw open the liquidity modals instead of a v2 form
 * (ADR-0012); those bring their own header, body and footer.
 */
export const OpenActionModal: FC<{
  open: OpenAction | null
  onClose: () => void
}> = ({ open, onClose }) => {
  const { t } = useTranslation("moneyMarket")
  const { market } = useMoneyMarket()
  const { data: summaries } = useReserveSummaries()
  const { getRelatedAToken } = useAssets()
  const resolveDisplay = useResolveReserveDisplay()
  const refreshMarket = useRefreshMarket()

  const title = (action: OpenAction["action"]) => {
    switch (action) {
      case "supply":
      case "withdraw":
      case "borrow":
      case "repay":
      case "claim":
        return t(action)
      case "collateral":
        return t("collateral.title")
      case "emode":
        return t("emode.title")
    }
  }

  const asset = open && "asset" in open ? open.asset : undefined
  const reserve = asset
    ? summaries?.find(
        (s) => s.underlyingAsset.toLowerCase() === asset.toLowerCase(),
      )
    : undefined
  const assetId = asset ? reserveAssetId(asset, market) : undefined
  const aToken = assetId ? getRelatedAToken(assetId) : undefined
  const route =
    open && "asset" in open && reserve
      ? actionRoute(open.action, reserve, market, !!aToken)
      : "form"

  if (route === "addStablepool" && reserve && assetId && aToken) {
    return (
      <Modal open onOpenChange={(open) => !open && onClose()} variant="popup">
        <AddStablepoolLiquidityWrapper
          id={assetId}
          stableswapId={assetId}
          erc20Id={aToken.id}
          initialOption="stablepool"
          closable
          title={t("supply.withSymbol", {
            symbol: resolveDisplay(reserve).symbol,
          })}
          onSubmitted={() => {
            onClose()
            refreshMarket()
          }}
        />
      </Modal>
    )
  }

  if (route === "supplyIsolated" && assetId) {
    return (
      <Modal open onOpenChange={(open) => !open && onClose()} variant="popup">
        <SupplyIsolatedLiquidity
          assetId={assetId}
          onSubmitted={() => {
            onClose()
            refreshMarket()
          }}
        />
      </Modal>
    )
  }

  if (route === "removeMoneyMarket" && reserve && assetId && aToken) {
    return (
      <Modal open onOpenChange={(open) => !open && onClose()} variant="popup">
        <RemoveMoneyMarketLiquidity
          poolId={assetId}
          stableswapId={assetId}
          erc20Id={aToken.id}
          closable
          title={t("withdraw.withSymbol", {
            symbol: resolveDisplay(reserve).symbol,
          })}
          onSubmitted={() => {
            onClose()
            refreshMarket()
          }}
        />
      </Modal>
    )
  }

  return (
    <ActionModal
      open={!!open}
      onClose={onClose}
      title={open ? title(open.action) : ""}
    >
      {open && <ActionForm open={open} onSubmitted={onClose} />}
    </ActionModal>
  )
}
