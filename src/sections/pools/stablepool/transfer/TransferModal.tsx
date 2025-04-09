import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions, Option } from "./TransferOptions"
import { useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { TFarmAprData } from "api/farms"
import { useRefetchAccountAssets } from "api/deposits"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import { DOT_ASSET_ID, GDOT_ERC20_ASSET_ID } from "utils/constants"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  MOVE_TO_OMNIPOOL,
  ASSETS,
  LIMIT_LIQUIDITY,
}

type Props = {
  onClose: () => void
  defaultPage: Page
  farms: TFarmAprData[]
}

export const TransferModal = ({ onClose, defaultPage, farms }: Props) => {
  const { getAssetWithFallback, tradable } = useAssets()
  const { pool } = usePoolData()
  const refetch = useRefetchAccountAssets()

  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)

  const { id: poolId, canAddLiquidity, isGigaDOT } = pool as TPoolFullData

  const assets = Object.keys(pool.meta.meta ?? {})

  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<string | undefined>(assets[0])

  const { page, direction, paginateTo } = useModalPagination(defaultPage)

  const [selectedOption, setSelectedOption] = useState<Option>(
    canAddLiquidity ? "OMNIPOOL" : "STABLEPOOL",
  )

  const isOnlyStablepool = selectedOption === "STABLEPOOL"

  const goBack = () => {
    if (page === Page.ASSETS) {
      paginateTo(Page.ADD_LIQUIDITY)
      return
    }

    if (page === Page.LIMIT_LIQUIDITY || page === Page.ASSETS) {
      paginateTo(Page.MOVE_TO_OMNIPOOL)
      return
    }

    const nextPage = page - 1

    if (nextPage === 0 && !canAddLiquidity) {
      onClose()
    }

    paginateTo(nextPage)
  }

  const title = isOnlyStablepool
    ? t(
        `liquidity.stablepool.transfer.stablepool${isGigaDOT ? ".gigadot" : ""}`,
      )
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
              <>
                <TransferOptions
                  disableOmnipool={!canAddLiquidity}
                  onSelect={setSelectedOption}
                  farms={farms}
                  selected={selectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => {
                    paginateTo(Page.ADD_LIQUIDITY)
                  }}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title,
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                isStablepoolOnly={isOnlyStablepool}
                onClose={onClose}
                onSubmitted={onClose}
                onSuccess={refetch}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={getAssetWithFallback(
                  isGigaDOT ? DOT_ASSET_ID : assetId ?? poolId,
                )}
                isJoinFarms={isJoinFarms && !isOnlyStablepool}
                setIsJoinFarms={setIsJoinFarms}
              />
            ),
          },
          {
            title,
            headerVariant: "gradient",
            content: (
              <AddLiquidityForm
                assetId={poolId}
                onClose={onClose}
                farms={farms}
                setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "GeistMono",
            noPadding: true,
            content: (
              <AssetsModalContent
                hideInactiveAssets
                allAssets
                allowedAssets={
                  isGigaDOT
                    ? tradable
                        .map((asset) => asset.id)
                        .filter((assetId) => assetId !== GDOT_ERC20_ASSET_ID)
                    : assets
                }
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
