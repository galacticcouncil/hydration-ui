import { Button } from "components/Button/Button"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { useEnteredDate } from "utils/block"
import { BN_0 } from "utils/constants"
import { JoinedFarmsDetails } from "sections/pools/farms/modals/joinedFarmDetails/JoinedFarmsDetails"
import {
  SContainer,
  SSeparator,
  SValueContainer,
} from "./FarmingPosition.styled"
import { useDepositShare } from "./FarmingPosition.utils"
import { JoinedFarms } from "./joined/JoinedFarms"
import { RedepositFarms } from "./redeposit/RedepositFarms"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useOmnipoolPosition } from "api/omnipool"
import { useDisplayPrice } from "utils/displayAsset"
import { getFloatingPointAmount } from "utils/balance"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useRpcProvider } from "providers/rpcProvider"
import { useFarmExitAllMutation } from "utils/farms/exit"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import ExitIcon from "assets/icons/Exit.svg?react"
import { Icon } from "components/Icon/Icon"

function FarmingPositionDetailsButton(props: {
  poolId: string
  depositNft: TMiningNftPosition
}) {
  const { t } = useTranslation()
  const [farmDetails, setFarmDetails] = useState(false)

  return (
    <>
      <Button size="compact" onClick={() => setFarmDetails(true)}>
        {t("farms.positions.joinedFarms.button.label")}
      </Button>

      {farmDetails && (
        <JoinedFarmsDetails
          poolId={props.poolId}
          depositNft={props.depositNft}
          isOpen={farmDetails}
          onClose={() => setFarmDetails(false)}
        />
      )}
    </>
  )
}

const ExitFarmsButton = (props: {
  poolId: string
  depositNft: TMiningNftPosition
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccount()

  const meta = assets.getAsset(props.poolId.toString())

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.exit.toast.${msType}`}
        tOptions={{
          amount: props.depositNft.data.shares.toBigNumber(),
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const exit = useFarmExitAllMutation([props.depositNft], toast)

  return (
    <Button
      size="compact"
      variant="error"
      onClick={() => exit.mutate()}
      isLoading={exit.isLoading}
      disabled={exit.isLoading || account?.isExternalWalletConnected}
    >
      <Icon icon={<ExitIcon />} />
      {t("farms.positions.exitFarms.button.label")}
    </Button>
  )
}

export const FarmingPosition = ({
  index,
  poolId,
  depositNft,
}: {
  index: number
  poolId: string
  depositNft: TMiningNftPosition
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const position = useDepositShare(poolId, depositNft.id.toString())

  const lpPosition = useOmnipoolPosition(position.data?.id)
  const meta = lpPosition.data?.assetId
    ? assets.getAsset(lpPosition.data.assetId.toString())
    : undefined
  const spotPrice = useDisplayPrice(lpPosition.data?.assetId)

  const initialPosValue =
    getFloatingPointAmount(
      lpPosition.data?.amount.toBigNumber() ?? 0,
      meta?.decimals ?? 12,
    ) ?? BN_0

  const initialPosPrice = initialPosValue.multipliedBy(
    spotPrice.data?.spotPrice ?? 1,
  )

  // use latest entry date
  const enteredDate = useEnteredDate(
    depositNft.data.yieldFarmEntries.reduce(
      (acc, curr) =>
        acc.lt(curr.enteredAt.toBigNumber())
          ? curr.enteredAt.toBigNumber()
          : acc,
      BN_0,
    ),
  )

  return (
    <SContainer>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text fw={[500, 400]}>
          {t("farms.positions.position.title", { index })}
        </Text>
        <div sx={{ flex: "row", gap: 8 }}>
          <ExitFarmsButton poolId={poolId} depositNft={depositNft} />
          <FarmingPositionDetailsButton
            poolId={poolId}
            depositNft={depositNft}
          />
        </div>
      </div>

      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          py: [0, 10],
        }}
      >
        <JoinedFarms poolId={poolId} depositNft={depositNft} />
      </div>
      <SSeparator sx={{ width: "70%", mx: "auto" }} />

      <div
        sx={{
          flex: "column",
          gap: 10,
          py: 10,
        }}
      >
        <SValueContainer>
          <Text color="basic500" fs={14} lh={16}>
            {t("farms.positions.labels.enterDate")}
          </Text>
          <Text fs={14}>
            {t("farms.positions.labels.enterDate.value", {
              date: enteredDate.data,
            })}
          </Text>
        </SValueContainer>
        <SSeparator />
        <SValueContainer>
          <Text color="basic500" fs={14} lh={16}>
            {t("farms.positions.labels.initialValue")}
          </Text>
          <div sx={{ flex: "column", align: "flex-end" }}>
            <Text fs={14}>
              {t("value.tokenWithSymbol", {
                value: initialPosValue,
                symbol: meta?.symbol,
              })}
            </Text>
            <Text fs={11} css={{ color: "rgba(221, 229, 255, 0.61)" }}>
              <DisplayValue value={initialPosPrice} />
            </Text>
          </div>
        </SValueContainer>
        <SSeparator />
        <SValueContainer>
          <div sx={{ flex: "row" }}>
            <Text color="basic500" fs={14} lh={16}>
              {t("farms.positions.labels.currentValue")}
            </Text>
            <LrnaPositionTooltip
              assetId={position.data?.assetId}
              tokenPosition={position.data?.value}
              lrnaPosition={position.data?.lrna}
            />
          </div>

          {position.data && (
            <div sx={{ flex: "column", align: "flex-end" }}>
              <WalletAssetsHydraPositionsData
                assetId={position.data.assetId.toString()}
                value={position.data.value}
                lrna={position.data.lrna}
                fontSize={14}
              />
              <DollarAssetValue
                value={position.data.valueDisplay}
                wrapper={(children) => (
                  <Text fs={11} lh={12} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={position.data.valueDisplay} />
              </DollarAssetValue>
            </div>
          )}
        </SValueContainer>
      </div>

      <RedepositFarms poolId={poolId} depositNft={depositNft} />
    </SContainer>
  )
}
