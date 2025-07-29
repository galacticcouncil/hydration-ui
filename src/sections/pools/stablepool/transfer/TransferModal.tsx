import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidityWrapper } from "./AddStablepoolLiquidity"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { TFarmAprData } from "api/farms"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { useSelectedDefaultAssetId } from "sections/pools/stablepool/transfer/TransferModal.utils"
import { TransferAssetSelector } from "sections/pools/stablepool/transfer/TransferAssetSelector"
import { AddProportionallySwitcher } from "sections/pools/stablepool/components/AddProportionallySwitcher"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  ASSETS,
  LIMIT_LIQUIDITY,
}

type Props = {
  onClose: () => void
  farms: TFarmAprData[]
  disabledOmnipool?: boolean
  initialAmount?: string
  initialAssetId?: string
  skipOptions?: boolean
}

export const TransferModal = ({
  onClose,
  disabledOmnipool,
  farms,
  initialAmount,
  initialAssetId,
  skipOptions,
}: Props) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const pool = usePoolData().pool as TStablepool

  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)
  const [split, setSplit] = useState(false)

  const stablepool = pool as TStablepool

  const {
    id: poolId,
    canAddLiquidity,
    isGETH,
    symbol,
    relatedAToken,
  } = stablepool

  const defaultAssetId = useSelectedDefaultAssetId(stablepool)

  const [assetId, setAssetId] = useState<string | undefined>(
    initialAssetId ?? defaultAssetId,
  )

  const isOnlyStablepool = disabledOmnipool || !canAddLiquidity

  const { page, direction, paginateTo } = useModalPagination(
    isOnlyStablepool || skipOptions ? Page.ADD_LIQUIDITY : Page.OPTIONS,
  )

  const [stablepoolSelected, setStablepoolSelected] = useState(isOnlyStablepool)

  const goBack = () => {
    if (page === Page.LIMIT_LIQUIDITY) {
      paginateTo(Page.ADD_LIQUIDITY)

      return
    }

    const nextPage = page - 1

    if (nextPage === 0 && (isOnlyStablepool || skipOptions)) {
      onClose()
    }

    paginateTo(nextPage)
  }

  const title = stablepoolSelected
    ? t(
        `liquidity.stablepool.transfer.stablepool${!!relatedAToken ? ".custom" : ""}`,
        { symbol },
      )
    : isGETH
      ? t("liquidity.add.modal.title.geth")
      : t(
          `liquidity.stablepool.transfer.addLiquidity${isJoinFarms ? ".joinFarms" : ""}`,
        )

  return (
    <Modal open onClose={onClose} disableCloseOutside>
      <ModalContents
        onClose={onClose}
        direction={direction}
        page={page}
        onBack={goBack}
        contents={[
          {
            title: t("liquidity.stablepool.transfer.options"),
            headerVariant: "gradient",
            content: (
              <TransferOptions
                farms={farms}
                disableOmnipool={!canAddLiquidity}
                onConfirm={(option) => {
                  setStablepoolSelected(option === "STABLEPOOL")
                  paginateTo(Page.ADD_LIQUIDITY)
                }}
              />
            ),
          },
          {
            title,
            headerVariant: "gradient",
            content: (
              <>
                <AddProportionallySwitcher value={split} onChange={setSplit} />
                <AddStablepoolLiquidityWrapper
                  key={`${split}`}
                  isStablepoolOnly={stablepoolSelected}
                  onClose={onClose}
                  onAssetOpen={() => paginateTo(Page.ASSETS)}
                  asset={getAssetWithFallback(assetId ?? poolId)}
                  isJoinFarms={isJoinFarms && !stablepoolSelected}
                  setIsJoinFarms={setIsJoinFarms}
                  initialAmount={initialAmount}
                  setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                  relatedAToken={relatedAToken}
                  pool={pool}
                  split={split}
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
                pool={stablepool}
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
