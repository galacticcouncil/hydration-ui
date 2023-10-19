import { isStablepool, Stablepool } from "sections/pools/PoolsPage.utils"
import { useTranslation } from "react-i18next"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { Stepper } from "components/Stepper/Stepper"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { RemoveLiquidityForm } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidityForm"
import { RemoveLiquidityForm as RemoveStablepoolLiquidityForm } from "./RemoveLiquidityForm"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveOption, RemoveOptions } from "./RemoveOptions"
import { Button } from "components/Button/Button"
import { BN_0 } from "utils/constants"
import BigNumber from "bignumber.js"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Text } from "components/Typography/Text/Text"

enum Page {
  OPTIONS,
  REMOVE_FROM_OMNIPOOL,
  WAIT,
  REMOVE_FROM_STABLEPOOL,
  ASSETS,
}

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

  const handleBack = () => {
    if (page === Page.ASSETS) {
      return paginateTo(Page.REMOVE_FROM_STABLEPOOL)
    }

    if (page === Page.REMOVE_FROM_STABLEPOOL) {
      return paginateTo(Page.REMOVE_FROM_OMNIPOOL)
    }

    paginateTo(page - 1)
  }

  const sharesAmountPercent = sharesAmount
    ? new BigNumber(sharesAmount).div(position.providedAmount).times(100)
    : BN_0

  const steps = [
    t("liquidity.stablepool.remove.options"),
    t("liquidity.stablepool.remove.omnipool"),
    t("liquidity.stablepool.remove.removing"),
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
                  onClick={() => paginateTo(Page.REMOVE_FROM_OMNIPOOL)}
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
                    paginateTo(Page.WAIT)
                  }
                }}
                onSuccess={() => {
                  if (selectedOption === "STABLE") {
                    paginateTo(Page.REMOVE_FROM_STABLEPOOL)
                  } else {
                    onSuccess()
                  }
                }}
              />
            ),
          },
          {
            title: t("liquidity.stablepool.remove.removing"),
            headerVariant: "gradient",
            content: (
              <div
                sx={{
                  flex: "column",
                  gap: 50,
                  align: "center",
                  justify: "center",
                  height: 240,
                }}
              >
                <Spinner width={50} height={50} />
                <Text color="whiteish500">
                  {t("liquidity.stablepool.remove.removing")}
                </Text>
              </div>
            ),
          },
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <RemoveStablepoolLiquidityForm
                defaultValue={sharesAmountPercent.toNumber()}
                assetId={assetId}
                onClose={onClose}
                position={{
                  reserves: pool.reserves,
                  fee: pool.fee,
                  poolId: pool.id,
                  amount: position.providedAmount,
                }}
                onSuccess={onSuccess}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                allAssets={true}
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
