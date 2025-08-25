import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useAssets } from "providers/assets"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { SplitSwitcher } from "sections/pools/stablepool/components/SplitSwitcher"
import { TransferAssetSelector } from "sections/pools/stablepool/transfer/TransferAssetSelector"
import { useSelectedDefaultAssetId } from "sections/pools/stablepool/transfer/TransferModal.utils"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { HollarPools } from "./HollarPools"
import { JoinStrategyFormWrapper } from "./JoinStrategyForm"

type JoinStrategyModalProps = {
  onClose: () => void
  pools: THollarPool[]
}

export enum Page {
  ADD_LIQUIDITY,
  ASSETS,
  LIMIT_LIQUIDITY,
}

export const JoinStrategyModal = ({
  pools,
  onClose,
}: JoinStrategyModalProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const [split, setSplit] = useState(false)
  const [selectedPool, selectPool] = useState(pools[0])

  const {
    data: { balances: reserveBalances, smallestPercentage },
  } = useStableSwapReserves(selectedPool.stablepoolId)

  const stablepoolAsset = getAssetWithFallback(selectedPool.meta.id)

  const defaultAssetId = useSelectedDefaultAssetId({
    stablepoolAsset,
    smallestPercentage,
  })

  const [assetId, setAssetId] = useState<string | undefined>(defaultAssetId)

  const { page, direction, paginateTo } = useModalPagination(Page.ADD_LIQUIDITY)

  return (
    <Modal open onClose={onClose} disableCloseOutside>
      <ModalContents
        onClose={onClose}
        direction={direction}
        page={page}
        onBack={() => paginateTo(Page.ADD_LIQUIDITY)}
        contents={[
          {
            title: t("wallet.strategy.hollar.join.label"),
            headerVariant: "gradient",
            content: (
              <>
                <HollarPools
                  pools={pools}
                  reserves={reserveBalances}
                  selectedPool={selectedPool}
                  selectPool={selectPool}
                />
                <SplitSwitcher
                  value={split}
                  title={t("liquidity.add.modal.split")}
                  onChange={setSplit}
                />
                <JoinStrategyFormWrapper
                  key={`${split}_${selectedPool.stablepoolId}`}
                  split={split}
                  reserves={reserveBalances}
                  poolId={selectedPool.stablepoolId}
                  farms={[]}
                  stablepoolAsset={stablepoolAsset}
                  isJoinFarms={false}
                  onClose={onClose}
                  asset={getAssetWithFallback(
                    assetId ?? selectedPool.stablepoolId,
                  )}
                  setIsJoinFarms={() => null}
                  setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                  onAssetOpen={() => paginateTo(Page.ASSETS)}
                  apy={selectedPool.apy}
                />
              </>
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "GeistMono",
            noPadding: true,
            content: (
              <TransferAssetSelector
                stablepoolAsset={stablepoolAsset}
                firstAssetId={defaultAssetId}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  paginateTo(Page.ADD_LIQUIDITY)
                }}
              />
            ),
          },
          {
            title: t("liquidity.add.modal.limit.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <LimitModal onConfirm={() => paginateTo(Page.ADD_LIQUIDITY)} />
            ),
          },
        ]}
      />
    </Modal>
  )
}
