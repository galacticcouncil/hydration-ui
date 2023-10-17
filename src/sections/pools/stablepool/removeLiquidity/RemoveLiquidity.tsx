import { isStablepool, Stablepool } from "sections/pools/PoolsPage.utils"
import { useTranslation } from "react-i18next"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useState } from "react"
import { Page } from "sections/pools/stablepool/transfer/TransferModal"
import { Modal } from "components/Modal/Modal"
import { Stepper } from "components/Stepper/Stepper"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { RemoveLiquidityForm } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidityForm"
import { RemoveLiquidityForm as RemoveStablepoolLiquidity } from "./RemoveLiquidityForm"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveOption, RemoveOptions } from "./RemoveOptions"
import { Button } from "components/Button/Button"

type RemoveStableSwapAssetProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  position: HydraPositionsTableData
  pool: Stablepool
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  onSuccess,
  pool,
  position,
}: RemoveStableSwapAssetProps) => {
  const { t } = useTranslation()
  const { page, direction, paginateTo } = useModalPagination(0)
  const [assetId, setAssetId] = useState<string>(pool.assets[0]?.id)
  const [selectedOption, setSelectedOption] = useState<RemoveOption>("SHARES")
  const [sharesAmount, setSharesAmount] = useState<string>()

  const handleBack = () => paginateTo(page - 1)

  const steps = [
    t("liquidity.stablepool.remove.options"),
    t("liquidity.stablepool.remove.omnipool"),
    t("liquidity.stablepool.remove.stablepool"),
  ]

  const getStepState = (stepPage: Page) => {
    if (stepPage === page) {
      return "active" as const
    }

    return page > stepPage ? ("done" as const) : ("todo" as const)
  }

  return (
    <Modal
      open={isOpen}
      disableCloseOutside={true}
      title={isStablepool(pool) ? undefined : t("liquidity.remove.modal.title")}
      onClose={onClose}
      topContent={
        page && selectedOption === "STABLE" ? (
          <Stepper
            steps={steps.map((step, idx) => ({
              label: step,
              state: getStepState(idx),
            }))}
          />
        ) : null
      }
    >
      <ModalContents
        direction={direction}
        onClose={onClose}
        page={page}
        onBack={handleBack}
        contents={[
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <>
                <RemoveOptions
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => paginateTo(1)}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <RemoveLiquidityForm
                onClose={() => {
                  if (selectedOption === "STABLE") {
                    return
                  }

                  onClose()
                }}
                position={position}
                onSubmitted={(shares) => {
                  if (selectedOption === "STABLE") {
                    setSharesAmount(shares)
                  }
                }}
                onSuccess={() => {
                  if (selectedOption === "STABLE") {
                    paginateTo(2)
                  } else {
                    onSuccess()
                  }
                }}
              />
            ),
          },
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <>
                Shares amount: {sharesAmount?.toString()}
                <RemoveStablepoolLiquidity
                  assetId={assetId}
                  onClose={onClose}
                  position={{
                    reserves: pool.reserves,
                    fee: pool.fee,
                    poolId: pool.id,
                    amount: position.providedAmount,
                  }}
                  onSuccess={onSuccess}
                  onAssetOpen={() => paginateTo(3)}
                />
              </>
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allowedAssets={pool.assets.map((asset) => asset.id)}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  handleBack()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
