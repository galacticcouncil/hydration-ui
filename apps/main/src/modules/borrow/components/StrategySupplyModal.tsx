import { Modal } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  AddStablepoolLiquidityProps,
  AddStablepoolLiquidityWrapper,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"
import { SupplyIsolatedLiquidity } from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity"
import { useAssets } from "@/providers/assetsProvider"

export type StrategySupplyModalProps = Omit<
  AddStablepoolLiquidityProps,
  "onSubmitted"
> & {
  isIsolated?: boolean
}

export const StrategySupplyModal = ({
  props,
  onClose,
}: {
  props: StrategySupplyModalProps | undefined
  onClose: () => void
}) => {
  const { t } = useTranslation("borrow")
  const { getAssetWithFallback } = useAssets()

  return (
    <Modal open={!!props} onOpenChange={onClose} variant="popup">
      {props &&
        (!props.isIsolated ? (
          <AddStablepoolLiquidityWrapper
            {...props}
            initialOption="stablepool"
            title={t("supply.withSymbol", {
              symbol: props.erc20Id
                ? getAssetWithFallback(props.erc20Id).symbol
                : undefined,
            })}
            closable
            onSubmitted={onClose}
          />
        ) : (
          <SupplyIsolatedLiquidity assetId={props.id} onSubmitted={onClose} />
        ))}
    </Modal>
  )
}
