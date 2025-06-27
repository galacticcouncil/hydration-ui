import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { TFarmAprData } from "api/farms"
import { useRefetchAccountAssets } from "api/deposits"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"
import {
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { useNewDepositDefaultAssetId } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

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
}

export const TransferModal = ({ onClose, disabledOmnipool, farms }: Props) => {
  const { getAssetWithFallback, tradable } = useAssets()
  const { pool } = usePoolData()
  const refetch = useRefetchAccountAssets()

  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)

  const {
    id: poolId,
    canAddLiquidity,
    isGigaDOT,
    isGETH,
    smallestPercentage,
    symbol,
  } = pool as TStablepool

  const assetIds = Object.keys(pool.meta.meta ?? {})

  const { data: defaultAssetId } = useNewDepositDefaultAssetId(poolId)

  const { t } = useTranslation()

  const [assetId, setAssetId] = useState<string | undefined>(
    isGigaDOT || isGETH ? defaultAssetId : smallestPercentage?.assetId,
  )

  const isOnlyStablepool = disabledOmnipool || !canAddLiquidity

  const { page, direction, paginateTo } = useModalPagination(
    isOnlyStablepool ? Page.ADD_LIQUIDITY : Page.OPTIONS,
  )

  const [stablepoolSelected, setStablepoolSelected] = useState(isOnlyStablepool)

  const selectableAssets = useMemo(() => {
    const invalidAssets = isGigaDOT
      ? [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID]
      : isGETH
        ? [GETH_ERC20_ASSET_ID, GETH_STABLESWAP_ASSET_ID]
        : []

    return isGigaDOT || isGETH
      ? tradable
          .map((asset) => asset.id)
          .filter((assetId) => !invalidAssets.includes(assetId))
      : assetIds
  }, [assetIds, isGigaDOT, isGETH, tradable])

  const goBack = () => {
    const nextPage = page - 1

    if (nextPage === 0 && isOnlyStablepool) {
      onClose()
    }

    paginateTo(nextPage)
  }

  const title = stablepoolSelected
    ? t(
        `liquidity.stablepool.transfer.stablepool${isGigaDOT || isGETH ? ".custom" : ""}`,
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
              <AddStablepoolLiquidity
                isStablepoolOnly={stablepoolSelected}
                onClose={onClose}
                onSubmitted={onClose}
                onSuccess={refetch}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={getAssetWithFallback(assetId ?? poolId)}
                isJoinFarms={isJoinFarms && !stablepoolSelected}
                setIsJoinFarms={setIsJoinFarms}
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
                allowedAssets={selectableAssets}
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
