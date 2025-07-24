import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { useState } from "react"
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
  useNewDepositAssets,
  useNewDepositDefaultAssetId,
} from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

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
  const { getAssetWithFallback, getErc20 } = useAssets()
  const { pool } = usePoolData()
  const refetch = useRefetchAccountAssets()

  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)

  const {
    id: poolId,
    canAddLiquidity,
    isGETH,
    smallestPercentage,
    symbol,
    relatedAToken,
  } = pool as TStablepool

  const assetIds = Object.keys(pool.meta.meta ?? {})

  const { data: defaultAssetId } = useNewDepositDefaultAssetId(pool.poolId)
  const depositAssetId = relatedAToken
    ? getErc20(relatedAToken.id)?.underlyingAssetId
    : undefined

  const selectableDepositAssets = useNewDepositAssets(depositAssetId ?? "", {
    firstAssetId: defaultAssetId,
  })

  const selectableAssets = relatedAToken ? selectableDepositAssets : assetIds

  const { t } = useTranslation()

  const [assetId, setAssetId] = useState<string | undefined>(
    initialAssetId ??
      (relatedAToken ? defaultAssetId : smallestPercentage?.assetId),
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
              <AddStablepoolLiquidity
                isStablepoolOnly={stablepoolSelected}
                onClose={onClose}
                onSubmitted={onClose}
                onSuccess={refetch}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={getAssetWithFallback(assetId ?? poolId)}
                isJoinFarms={isJoinFarms && !stablepoolSelected}
                setIsJoinFarms={setIsJoinFarms}
                initialAmount={initialAmount}
                setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                relatedAToken={relatedAToken}
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
                displayZeroBalance
                naturallySorted
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
