import { Modal } from "components/Modal/Modal"
import {
  LoadgingPage,
  ModalContents,
} from "components/Modal/contents/ModalContents"
import { TransferOptions, Option } from "./TransferOptions"
import { useState } from "react"
import { Button } from "components/Button/Button"
import { Trans, useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { getStepState, Stepper } from "components/Stepper/Stepper"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useRpcProvider } from "providers/rpcProvider"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { BN_0 } from "utils/constants"
import { TStableSwap } from "api/assetDetails"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { QUERY_KEYS } from "utils/queryKeys"
import { Farm } from "api/farms"
import { useJoinFarms } from "utils/farms/deposit"
import { ISubmittableResult } from "@polkadot/types/types"
import { useRefetchAccountNFTPositions } from "api/deposits"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { scaleHuman } from "utils/balance"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  WAIT,
  MOVE_TO_OMNIPOOL,
  ASSETS,
}

type Props = {
  pool: Omit<
    TPoolFullData,
    "volumeDisplay" | "omnipoolNftPositions" | "miningNftPositions"
  >
  onClose: () => void
  defaultPage: Page
  farms: Farm[]
}

export const TransferModal = ({ pool, onClose, defaultPage, farms }: Props) => {
  const { assets, api } = useRpcProvider()
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const refetch = useRefetchAccountNFTPositions()
  const { createTransaction } = useStore()

  const { id: poolId, reserves, stablepoolFee: fee, canAddLiquidity } = pool

  const meta = assets.getAsset(poolId) as TStableSwap

  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<string | undefined>(meta.assets[0])
  const [sharesAmount, setSharesAmount] = useState<string>()
  const [currentStep, setCurrentStep] = useState(0)

  const { page, direction, paginateTo } = useModalPagination(defaultPage)

  const [selectedOption, setSelectedOption] = useState<Option>(
    canAddLiquidity ? "OMNIPOOL" : "STABLEPOOL",
  )

  const isOnlyStablepool = selectedOption === "STABLEPOOL"
  const isAddingToOmnipool = defaultPage === Page.MOVE_TO_OMNIPOOL
  const isVisibleStepper = farms.length || !isAddingToOmnipool
  const isFarms = farms.length
  const isMultipleFarms = farms.length > 1

  const joinFarms = useJoinFarms({
    poolId: pool.id,
    farms,
    deposit: {
      onClose,
      disableAutoClose: isMultipleFarms,
      onSuccess: () => {
        setCurrentStep(currentStep + 1)
      },
    },
    redeposit: {
      onClose,
    },
  })

  const farmSteps = [
    {
      label: t("farms.modal.join.first"),
      loadingLabel: t("farms.modal.join.first.loading"),
    },
    ...(isMultipleFarms
      ? [
          {
            label: t("farms.modal.join.rest"),
            loadingLabel: t("farms.modal.join.rest.loading"),
          },
        ]
      : []),
  ]

  const steps = [
    ...(isAddingToOmnipool
      ? []
      : [
          {
            label: t("liquidity.stablepool.transfer.select"),
            loadingLabel: t("liquidity.stablepool.transfer.select"),
          },
          {
            label: t("liquidity.stablepool.transfer.provide"),
            loadingLabel: t("liquidity.stablepool.transfer.adding"),
          },
        ]),
    ...(isOnlyStablepool
      ? []
      : [
          {
            label: t("liquidity.stablepool.transfer.move"),
            loadingLabel: t("liquidity.stablepool.transfer.adding"),
          },
          ...(isFarms ? farmSteps : []),
        ]),
  ]

  const onAddToOmnipoolSuccess = async (
    result: ISubmittableResult,
    value: string,
  ) => {
    refetch()
    if (isFarms) {
      setCurrentStep(currentStep + 1)

      for (const record of result.events) {
        if (api.events.omnipool.PositionCreated.is(record.event)) {
          const positionId = record.event.data.positionId.toString()
          joinFarms({ positionId, value })
        }
      }
    }
  }

  const onAddToStablepoolSuccess = async (result: ISubmittableResult) => {
    for (const record of result.events) {
      if (api.events.tokens.Deposited.is(record.event)) {
        if (record.event.data.currencyId.toString() === pool.id) {
          const shares = record.event.data.amount.toString()

          const toast = TOAST_MESSAGES.reduce((memo, type) => {
            const msType = type === "onError" ? "onLoading" : type
            memo[type] = (
              <Trans
                t={t}
                i18nKey={`liquidity.add.modal.toast.${msType}`}
                tOptions={{
                  value: scaleHuman(shares, meta.decimals),
                  symbol: meta.symbol,
                  where: "Omnipool",
                }}
              >
                <span />
                <span className="highlight" />
              </Trans>
            )
            return memo
          }, {} as ToastMessage)

          await createTransaction(
            {
              tx: api.tx.omnipool.addLiquidity(pool.id, shares),
              title: t("liquidity.stablepool.transfer.move"),
            },
            {
              onSuccess: (result) => {
                onAddToOmnipoolSuccess(result, shares)
              },
              onSubmitted: () => {
                !isFarms && onClose()
              },
              onClose,
              disableAutoClose: !!isFarms,
              toast,
            },
          )

          return
        }
      }
    }
  }

  const goBack = () => {
    if (page === Page.ASSETS) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    if (page === Page.MOVE_TO_OMNIPOOL) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    paginateTo(page - 1)
    setCurrentStep(currentStep - 1)
  }

  return (
    <Modal
      open
      onClose={onClose}
      disableCloseOutside={true}
      topContent={
        isVisibleStepper ? (
          <Stepper
            sx={{ px: [10] }}
            width={420}
            steps={steps.map((step, idx) => ({
              label: step.label,
              state: getStepState(idx, currentStep),
            }))}
          />
        ) : undefined
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
                  disableOmnipool={!canAddLiquidity}
                  onSelect={setSelectedOption}
                  selected={selectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => {
                    paginateTo(Page.ADD_LIQUIDITY)
                    setCurrentStep(1)
                  }}
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
                isStablepoolOnly={isOnlyStablepool}
                poolId={poolId}
                onCancel={onClose}
                farms={farms}
                onClose={() => {
                  if (isOnlyStablepool) {
                    onClose()
                  }
                }}
                onSubmitted={(shares) => {
                  if (isOnlyStablepool) {
                    onClose()
                  }

                  setSharesAmount(shares)
                  paginateTo(Page.WAIT)
                }}
                onSuccess={(result) => {
                  if (isOnlyStablepool) {
                    queryClient.invalidateQueries(
                      QUERY_KEYS.tokenBalance(pool.id, account?.address),
                    )
                    refetch()
                    return
                  }

                  setCurrentStep(currentStep + 1)
                  onAddToStablepoolSuccess(result)
                  paginateTo(Page.WAIT)
                }}
                reserves={reserves}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={assets.getAsset(assetId ?? poolId)}
                fee={fee ?? BN_0}
              />
            ),
          },
          {
            title: steps[currentStep].label,
            headerVariant: "gradient",
            content: <LoadgingPage title={steps[currentStep].loadingLabel} />,
          },
          {
            title: t("liquidity.stablepool.addToOmnipool"),
            headerVariant: "gradient",
            content: (
              <AddLiquidityForm
                initialAmount={sharesAmount}
                assetId={poolId}
                onClose={onClose}
                farms={farms}
                onSuccess={onAddToOmnipoolSuccess}
                onSubmitted={() => paginateTo(Page.WAIT)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "GeistMono",
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allAssets={true}
                allowedAssets={meta.assets}
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
