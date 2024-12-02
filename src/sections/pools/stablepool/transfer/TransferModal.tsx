import { Modal } from "components/Modal/Modal"
import {
  LoadingPage,
  ModalContents,
} from "components/Modal/contents/ModalContents"
import { TransferOptions, Option } from "./TransferOptions"
import { useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { getStepState, Stepper } from "components/Stepper/Stepper"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useRpcProvider } from "providers/rpcProvider"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TFarmAprData } from "api/farms"
import { useJoinFarms } from "utils/farms/deposit"
import { ISubmittableResult } from "@polkadot/types/types"
import { useRefetchAccountAssets } from "api/deposits"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { scaleHuman } from "utils/balance"
import { isEvmAccount } from "utils/evm"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  WAIT,
  MOVE_TO_OMNIPOOL,
  ASSETS,
}

type Props = {
  onClose: () => void
  defaultPage: Page
  farms: TFarmAprData[]
}

export const TransferModal = ({ onClose, defaultPage, farms }: Props) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { pool } = usePoolData()
  const refetch = useRefetchAccountAssets()
  const { createTransaction } = useStore()
  const isEvm = isEvmAccount(account?.address)
  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)

  const {
    id: poolId,
    reserves,
    stablepoolFee: fee,
    canAddLiquidity,
    meta,
  } = pool as TPoolFullData

  const assets = Object.keys(pool.meta.meta ?? {})

  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<string | undefined>(assets[0])
  const [sharesAmount, setSharesAmount] = useState<string>()
  const [currentStep, setCurrentStep] = useState(0)

  const { page, direction, paginateTo } = useModalPagination(defaultPage)

  const [selectedOption, setSelectedOption] = useState<Option>(
    canAddLiquidity ? "OMNIPOOL" : "STABLEPOOL",
  )

  const isOptionsPage = defaultPage === Page.OPTIONS
  const isOnlyStablepool = selectedOption === "STABLEPOOL"
  const isAddingToOmnipool = defaultPage === Page.MOVE_TO_OMNIPOOL
  const isVisibleStepper = farms.length > 0 || !isAddingToOmnipool
  const willJoinFarms = farms.length > 0 && isJoinFarms
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
      onError: () => onClose(),
    },
    redeposit: {
      onClose,
      onError: () => onClose(),
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
    ...(isOptionsPage
      ? [
          {
            label: t("liquidity.stablepool.transfer.select"),
            loadingLabel: t("liquidity.stablepool.transfer.select"),
          },
        ]
      : []),
    ...(isAddingToOmnipool
      ? []
      : [
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
          ...(willJoinFarms ? farmSteps : []),
        ]),
  ]

  const onAddToOmnipoolSuccess = async (
    result: ISubmittableResult,
    value: string,
  ) => {
    refetch()
    if (willJoinFarms) {
      let positionId: string | undefined

      if (isEvm) {
        const nftId = await api.consts.omnipool.nftCollectionId.toString()
        const positions = await api.query.uniques.account.entries(
          account?.address,
          nftId,
        )

        positionId = positions
          .map((position) => position[0].args[2].toNumber())
          .sort((a, b) => b - a)[0]
          .toString()
      } else {
        for (const record of result.events) {
          if (api.events.omnipool.PositionCreated.is(record.event)) {
            positionId = record.event.data.positionId.toString()
          }
        }
      }

      if (positionId) {
        setCurrentStep((step) => step + 1)
        joinFarms({ positionId, value })
      } else {
        onClose()
      }
    }
  }

  const onAddToStablepoolSuccess = async (
    result: ISubmittableResult,
    calculatedShares: string,
  ) => {
    let shares = ""

    if (!isEvm) {
      for (const record of result.events) {
        if (api.events.tokens.Deposited.is(record.event)) {
          if (record.event.data.currencyId.toString() === pool.id) {
            shares = record.event.data.amount.toString()
          }
        }
      }
    } else {
      const balance = await api.query.tokens.accounts(
        account?.address ?? "",
        pool.id,
      )
      const free = balance.free.toBigNumber()
      const diff = scaleHuman(free, STABLEPOOL_TOKEN_DECIMALS)
        .minus(scaleHuman(calculatedShares, STABLEPOOL_TOKEN_DECIMALS))
        .abs()

      // go with the whole balance
      if (diff.lt(0.1)) {
        shares = free.toString()
      } else {
        shares = calculatedShares
      }
    }

    if (shares) {
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
            !willJoinFarms && onClose()
          },
          onError: () => onClose(),
          onClose,
          disableAutoClose: !!willJoinFarms,
          toast: createToastMessages("liquidity.add.modal.toast", {
            t,
            tOptions: {
              value: scaleHuman(shares, meta.decimals),
              symbol: meta.symbol,
              where: "Omnipool",
            },
          }),
        },
      )
    } else {
      onClose()
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
    setCurrentStep((step) => step - 1)
  }

  return (
    <Modal
      open
      onClose={onClose}
      disableCloseOutside={true}
      topContent={
        isVisibleStepper && steps.length > 1 ? (
          <Stepper
            sx={{ px: [10] }}
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
                  farms={farms}
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
                onClose={onClose}
                onSubmitted={(shares) => {
                  if (isOnlyStablepool) {
                    onClose()
                  }

                  setSharesAmount(shares)
                  paginateTo(Page.WAIT)
                }}
                onSuccess={(result, shares) => {
                  if (isOnlyStablepool) {
                    refetch()
                    return
                  }

                  setCurrentStep((step) => step + 1)
                  onAddToStablepoolSuccess(result, shares)
                  paginateTo(Page.WAIT)
                }}
                reserves={reserves}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={getAssetWithFallback(assetId ?? poolId)}
                fee={fee ?? BN_0}
                isJoinFarms={isJoinFarms && !isOnlyStablepool}
                setIsJoinFarms={setIsJoinFarms}
              />
            ),
          },
          {
            title: steps[currentStep].label,
            headerVariant: "gradient",
            content: <LoadingPage title={steps[currentStep].loadingLabel} />,
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
                isJoinFarms={isJoinFarms}
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
                hideInactiveAssets={true}
                allAssets={true}
                allowedAssets={assets}
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
