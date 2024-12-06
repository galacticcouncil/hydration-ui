import { TFarmAprData, useFarmCurrentPeriod } from "api/farms"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { ClaimRewardsCard } from "sections/pools/farms/components/claimableCard/ClaimRewardsCard"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { ToastMessage } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { useFarmExitAllMutation } from "utils/farms/exit"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  isXYKDeposit,
  TDepositData,
} from "sections/pools/farms/position/FarmingPosition.utils"
import { usePoolData } from "sections/pools/pool/Pool"
import { TDeposit } from "api/deposits"
import { useJoinFarms } from "utils/farms/deposit"
import BigNumber from "bignumber.js"

function isFarmJoined(depositNft: TDeposit, farm: TFarmAprData) {
  return depositNft.data.yieldFarmEntries.find(
    (entry) =>
      BigNumber(entry.globalFarmId).eq(farm.globalFarmId) &&
      BigNumber(entry.yieldFarmId).eq(farm.yieldFarmId),
  )
}

function JoinedFarmsDetailsRedeposit(props: {
  depositNft: TDeposit
  depositData: TDepositData
  onSelect: (value: { farm: TFarmAprData }) => void
  onTxClose: () => void
}) {
  const { pool } = usePoolData()
  const { id: poolId, farms } = pool
  const deposit = props.depositData
  const isXYK = isXYKDeposit(deposit)

  const { t } = useTranslation()
  const { account } = useAccount()

  const availableFarms = farms.filter(
    (farm) => !isFarmJoined(props.depositNft, farm),
  )

  const joinFarms = useJoinFarms({
    poolId,
    farms: availableFarms,
    options: {
      onSubmitted: () => props.onTxClose(),
      onBack: () => {},
      onClose: () => props.onTxClose(),
    },
  })

  if (!availableFarms?.length) return null

  return (
    <>
      <Text color="neutralGray100" sx={{ mb: 18 }}>
        {t("farms.modal.joinedFarms.available.label")}
      </Text>
      <div sx={{ flex: "column", gap: 12 }}>
        {availableFarms?.map((farm, i) => (
          <FarmDetailsCard
            key={i}
            farm={farm}
            onSelect={() =>
              props.onSelect({
                farm,
              })
            }
          />
        ))}
        <Button
          fullWidth
          variant="primary"
          sx={{ mt: 16 }}
          onClick={() =>
            isXYK
              ? joinFarms({
                  depositId: props.depositNft.id,
                  shares: props.depositNft.data.shares.toString(),
                })
              : joinFarms({
                  positionId: "",
                  value: deposit.totalValueShifted.toString() ?? "",
                  depositId: props.depositNft.id,
                })
          }
          disabled={account?.isExternalWalletConnected}
        >
          {t("farms.modal.joinedFarms.button.joinAll.label")}
        </Button>
      </div>
    </>
  )
}

function JoinedFarmsDetailsPositions(props: {
  depositNft: TDeposit
  depositData: TDepositData
  onSelect: (value: { farm: TFarmAprData; depositNft: TDeposit }) => void
  onTxClose: () => void
}) {
  const { t } = useTranslation()
  const { pool } = usePoolData()
  const { meta, id: poolId, farms } = pool
  const { account } = useAccount()

  const joinedFarms = farms.filter((farm) =>
    isFarmJoined(props.depositNft, farm),
  )

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.exit.toast.${msType}`}
        tOptions={{
          amount: BigNumber(props.depositNft.data.shares),
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const exit = useFarmExitAllMutation(
    [props.depositNft],
    poolId,
    toast,
    props.onTxClose,
  )

  return (
    <>
      <Text color="neutralGray100" sx={{ mb: 18, mt: 20 }}>
        {t("farms.modal.joinedFarms.joined.label")}
      </Text>

      <ClaimRewardsCard
        depositNft={props.depositNft}
        onTxClose={props.onTxClose}
      />

      <div sx={{ flex: "column", gap: 12, mt: 12 }}>
        {joinedFarms.map((farm, i) => (
          <FarmDetailsCard
            key={i}
            farm={farm}
            depositNft={props.depositNft}
            depositData={props.depositData}
            onSelect={() =>
              props.onSelect({
                farm,
                depositNft: props.depositNft,
              })
            }
          />
        ))}
      </div>

      <Button
        sx={{ width: "fit-content", my: 24 }}
        css={{ alignSelf: "center" }}
        onClick={() => exit.mutate()}
        isLoading={exit.isLoading}
        disabled={account?.isExternalWalletConnected}
      >
        {t("farms.modal.joinedFarms.button.exit.label")}
      </Button>
    </>
  )
}

export const JoinedFarmsDetails = (props: {
  isOpen: boolean
  onClose: () => void
  depositNft: TDeposit
  depositData: TDepositData
}) => {
  const { t } = useTranslation()
  const { pool } = usePoolData()
  const [selectedFarm, setSelectedFarm] = useState<{
    farm: TFarmAprData
    depositNft?: TDeposit
  } | null>(null)

  const { getCurrentPeriod } = useFarmCurrentPeriod()

  const currentBlock = selectedFarm
    ? getCurrentPeriod(selectedFarm.farm.blocksPerPeriod)
    : undefined

  const { page, direction, back, next } = useModalPagination()
  const onBack = () => {
    back()
    setSelectedFarm(null)
  }

  return (
    <Modal open={props.isOpen} onClose={props.onClose} disableCloseOutside>
      <ModalContents
        page={page}
        direction={direction}
        onClose={props.onClose}
        onBack={onBack}
        contents={[
          {
            title: t("farms.modal.join.title", {
              assetSymbol: pool.meta.symbol,
            }),
            content: (
              <div sx={{ flex: "column" }}>
                <JoinedFarmsDetailsPositions
                  depositNft={props.depositNft}
                  depositData={props.depositData}
                  onSelect={(value) => {
                    setSelectedFarm(value)
                    next()
                  }}
                  onTxClose={props.onClose}
                />

                <JoinedFarmsDetailsRedeposit
                  depositData={props.depositData}
                  depositNft={props.depositNft}
                  onSelect={(value) => {
                    setSelectedFarm(value)
                    next()
                  }}
                  onTxClose={props.onClose}
                />
              </div>
            ),
          },
          {
            content: selectedFarm && (
              <FarmDetailsModal
                farm={selectedFarm.farm}
                depositNft={selectedFarm?.depositNft}
                depositData={props.depositData}
                currentBlock={currentBlock?.toNumber()}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
