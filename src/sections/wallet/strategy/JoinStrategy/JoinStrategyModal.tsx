import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useAssets } from "providers/assets"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { SplitSwitcher } from "sections/pools/stablepool/components/SplitSwitcher"
import { TransferAssetSelector } from "sections/pools/stablepool/transfer/TransferAssetSelector"
import { useSelectedDefaultAssetId } from "sections/pools/stablepool/transfer/TransferModal.utils"
import { THollarPoolWithAccountBalance } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { HollarPools } from "./HollarPools"
import { JoinStrategyFormWrapper } from "./JoinStrategyForm"

type JoinStrategyModalProps = {
  onClose: () => void
  pools: THollarPoolWithAccountBalance[]
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

  const stablepoolAsset = getAssetWithFallback(selectedPool.meta.id)

  const defaultAssetId = useSelectedDefaultAssetId({
    stablepoolAsset,
    smallestPercentage: selectedPool.stablepoolData.smallestPercentage,
  })

  const [assetId, setAssetId] = useState(
    defaultAssetId ?? selectedPool.stablepoolId,
  )

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
                  reserves={selectedPool.stablepoolData.balances}
                  selectedPool={selectedPool}
                  selectPool={(pool, defaultAssetId) => {
                    selectPool(pool)
                    setAssetId(defaultAssetId)
                  }}
                />
                <SplitSwitcher
                  value={split}
                  title={t("liquidity.add.modal.split")}
                  onChange={setSplit}
                />
                <JoinStrategyFormWrapper
                  key={`${split}_${selectedPool.stablepoolId}`}
                  split={split}
                  reserves={selectedPool.stablepoolData.balances}
                  poolId={selectedPool.stablepoolId}
                  farms={[]}
                  stablepoolAsset={stablepoolAsset}
                  isJoinFarms={false}
                  onClose={onClose}
                  asset={getAssetWithFallback(assetId)}
                  setIsJoinFarms={() => null}
                  setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                  onAssetOpen={() => paginateTo(Page.ASSETS)}
                  apy={selectedPool.apy}
                  isStablepoolOnly
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
              <LimitModal
                onConfirm={() => paginateTo(Page.ADD_LIQUIDITY)}
                type={split || !stablepoolAsset.isErc20 ? "liquidity" : "swap"}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
