import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidityWrapper } from "./AddStablepoolLiquidity"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { useAssets } from "providers/assets"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { useSelectedDefaultAssetId } from "sections/pools/stablepool/transfer/TransferModal.utils"
import { TransferAssetSelector } from "sections/pools/stablepool/transfer/TransferAssetSelector"
import { SplitSwitcher } from "sections/pools/stablepool/components/SplitSwitcher"
import { TFarmAprData } from "api/farms"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  ASSETS,
  LIMIT_LIQUIDITY,
}

type Props = {
  stablepoolAssetId: string
  poolId: string
  onClose: () => void
  farms: TFarmAprData[]
  disabledOmnipool?: boolean
  initialAmount?: string
  initialAssetId?: string
  skipOptions?: boolean
}

export const TransferModal = ({
  stablepoolAssetId,
  poolId,
  onClose,
  disabledOmnipool,
  farms,
  initialAmount,
  initialAssetId,
  skipOptions,
}: Props) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const {
    data: { reserves, smallestPercentage },
  } = useStableSwapReserves(poolId)

  const stablepoolAsset = getAssetWithFallback(stablepoolAssetId)

  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)
  const [split, setSplit] = useState(false)

  const defaultAssetId = useSelectedDefaultAssetId({
    stablepoolAsset,
    smallestPercentage,
  })

  const [assetId, setAssetId] = useState<string | undefined>(
    initialAssetId ?? defaultAssetId,
  )

  const isOnlyStablepool = disabledOmnipool

  const { page, direction, paginateTo } = useModalPagination(
    isOnlyStablepool || skipOptions ? Page.ADD_LIQUIDITY : Page.OPTIONS,
  )

  const [stablepoolSelected, setStablepoolSelected] =
    useState(!!isOnlyStablepool)

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
        `liquidity.stablepool.transfer.stablepool${stablepoolAsset.isErc20 ? ".custom" : ""}`,
        { symbol: stablepoolAsset.symbol },
      )
    : t(
        `liquidity.stablepool.transfer.addLiquidity${isJoinFarms ? ".joinFarms" : ""}`,
        { symbol: stablepoolAsset.isErc20 ? stablepoolAsset.symbol : "" },
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
                disableOmnipool={isOnlyStablepool}
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
                <SplitSwitcher
                  value={split}
                  title={t("liquidity.add.modal.split")}
                  onChange={setSplit}
                />
                <AddStablepoolLiquidityWrapper
                  key={`${split}`}
                  split={split}
                  reserves={reserves}
                  poolId={poolId}
                  farms={farms}
                  initialAmount={initialAmount}
                  stablepoolAsset={stablepoolAsset}
                  isStablepoolOnly={stablepoolSelected}
                  isJoinFarms={isJoinFarms && !stablepoolSelected}
                  onClose={onClose}
                  asset={getAssetWithFallback(assetId ?? poolId)}
                  setIsJoinFarms={setIsJoinFarms}
                  setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                  onAssetOpen={() => paginateTo(Page.ASSETS)}
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
