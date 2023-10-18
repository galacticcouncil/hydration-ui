import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions, Option } from "./components/TransferOptions"
import { useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { BalanceByAsset } from "sections/pools/PoolsPage.utils"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"
import { Stepper } from "components/Stepper/Stepper"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { STitleGradient } from "components/Modal/header/ModalHeader.styled"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  WAIT,
  MOVE_TO_OMNIPOOL,
  ASSETS,
}

type Props = {
  poolId: u32
  isOpen: boolean
  onClose: () => void
  fee: BigNumber
  balanceByAsset?: BalanceByAsset
  refetchPositions: () => void
  assets: { id: string }[]
  reserves: { asset_id: number; amount: string }[]
  defaultPage?: Page
}

export const TransferModal = ({
  assets,
  poolId,
  fee,
  isOpen,
  onClose,
  balanceByAsset,
  reserves,
  refetchPositions,
  defaultPage,
}: Props) => {
  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<string>(assets[0]?.id)
  const [sharesAmount, setSharesAmount] = useState<string>()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { page, direction, paginateTo } = useModalPagination(
    defaultPage ?? Page.OPTIONS,
  )

  const rpcProvider = useRpcProvider()

  const [selectedOption, setSelectedOption] = useState<Option>("OMNIPOOL")
  const isStablepool = selectedOption === "STABLEPOOL"

  const steps = isStablepool
    ? [
        t("liquidity.stablepool.transfer.select"),
        t("liquidity.stablepool.transfer.provide"),
        t("liquidity.stablepool.transfer.confirm"),
      ]
    : [
        t("liquidity.stablepool.transfer.select"),
        t("liquidity.stablepool.transfer.provide"),
        t("liquidity.stablepool.transfer.adding"),
        t("liquidity.stablepool.transfer.move"),
      ]

  const getStepState = (stepPage: Page) => {
    if (stepPage === page) {
      return "active" as const
    }

    return page > stepPage ? ("done" as const) : ("todo" as const)
  }

  const goBack = () => {
    if (page === Page.ASSETS) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    if (page === Page.MOVE_TO_OMNIPOOL) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    paginateTo(page - 1)
  }

  const renderStepper = isDesktop ? (
    <Stepper
      steps={steps.map((step, idx) => ({
        label: step,
        state: getStepState(idx),
      }))}
    />
  ) : (
    <Text color="whiteish500">
      {t("liquidity.stablepool.transfer.step", {
        current: page + 1,
        total: steps.length,
      })}
    </Text>
  )

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      disableCloseOutside={true}
      topContent={
        !defaultPage && ![Page.OPTIONS, Page.ASSETS].includes(page)
          ? renderStepper
          : undefined
      }
    >
      <ModalContents
        onClose={onClose}
        direction={direction}
        page={page}
        onBack={
          !defaultPage && ![Page.OPTIONS, Page.WAIT].includes(page)
            ? goBack
            : undefined
        }
        contents={[
          {
            title: t("liquidity.stablepool.transfer.options"),
            headerVariant: "gradient",
            content: (
              <>
                <TransferOptions
                  onSelect={setSelectedOption}
                  selected={selectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => paginateTo(Page.ADD_LIQUIDITY)}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title: t("liquidity.add.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                poolId={poolId}
                balanceByAsset={balanceByAsset}
                onCancel={onClose}
                onClose={() => {
                  if (isStablepool) {
                    onClose()
                  }
                }}
                onSubmitted={(shares) => {
                  if (isStablepool) {
                    onClose()
                  }

                  setSharesAmount(shares)
                  paginateTo(Page.WAIT)
                }}
                onSuccess={() => {
                  if (isStablepool) {
                    return refetchPositions()
                  }

                  paginateTo(Page.MOVE_TO_OMNIPOOL)
                }}
                reserves={reserves}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={rpcProvider.assets.getAsset(assetId)}
                fee={fee}
              />
            ),
          },
          {
            title: t("liquidity.stablepool.move.modal.title"),
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
                  {t("liquidity.stablepool.transfer.adding")}
                </Text>
              </div>
            ),
          },
          {
            title: t("liquidity.stablepool.move.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddLiquidityForm
                initialAmount={sharesAmount}
                assetId={poolId.toString()}
                onSuccess={() => {
                  refetchPositions()
                  onClose()
                }}
                onClose={onClose}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "FontOver",
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allAssets={true}
                allowedAssets={assets.map((asset) => asset.id)}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  paginateTo(Page.ADD_LIQUIDITY)
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
