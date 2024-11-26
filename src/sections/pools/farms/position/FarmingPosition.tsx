import { Button } from "components/Button/Button"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useEnteredDate } from "utils/block"
import { BN_0 } from "utils/constants"
import { JoinedFarmsDetails } from "sections/pools/farms/modals/joinedFarmDetails/JoinedFarmsDetails"
import { SSeparator, SValueContainer } from "./FarmingPosition.styled"
import {
  isXYKDeposit,
  TDepositData,
  TOmniDepositData,
  TXYKDepositData,
} from "./FarmingPosition.utils"
import { JoinedFarms } from "./joined/JoinedFarms"
import { RedepositFarms } from "./redeposit/RedepositFarms"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useFarmExitAllMutation } from "utils/farms/exit"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import ExitIcon from "assets/icons/Exit.svg?react"
import { Icon } from "components/Icon/Icon"
import {
  TFarmAprData,
  useAccountClaimableFarmValues,
  useSummarizeClaimableValues,
} from "api/farms"
import { usePoolData } from "sections/pools/pool/Pool"
import { TDeposit } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { LinearProgress } from "components/Progress"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Separator } from "components/Separator/Separator"
import { useMedia } from "react-use"
import { theme } from "theme"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"

function FarmingPositionDetailsButton(props: {
  depositNft: TDeposit
  depositData: TDepositData
}) {
  const { t } = useTranslation()
  const [farmDetails, setFarmDetails] = useState(false)

  return (
    <>
      <Button
        size="compact"
        onClick={() => setFarmDetails(true)}
        css={{ flex: "1 0 0 " }}
      >
        {t("farms.positions.joinedFarms.button.label")}
      </Button>

      {farmDetails && (
        <JoinedFarmsDetails
          depositNft={props.depositNft}
          depositData={props.depositData}
          isOpen={farmDetails}
          onClose={() => setFarmDetails(false)}
        />
      )}
    </>
  )
}

const ExitFarmsButton = (props: { depositNft: TDeposit }) => {
  const { t } = useTranslation()
  const { pool } = usePoolData()
  const { account } = useAccount()

  const { meta, id: poolId } = pool

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

  const exit = useFarmExitAllMutation([props.depositNft], poolId, toast)

  return (
    <Button
      size="compact"
      variant="error"
      onClick={() => exit.mutate()}
      isLoading={exit.isLoading}
      disabled={exit.isLoading || account?.isExternalWalletConnected}
      css={{ flex: "1 0 0 " }}
    >
      <Icon icon={<ExitIcon />} />
      {t("farms.positions.exitFarms.button.label")}
    </Button>
  )
}

export const FarmingPosition = ({
  index,
  depositNft,
  availableYieldFarms,
  depositData,
}: {
  index: number
  depositNft: TDeposit
  depositData: TDepositData
  availableYieldFarms: TFarmAprData[]
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { isShareToken, getAssetWithFallback } = useAssets()
  const {
    pool: { meta },
  } = usePoolData()
  const { data: claimableValues } = useAccountClaimableFarmValues()

  const poolClaimableValues =
    claimableValues
      ?.get(isShareToken(meta) ? meta.poolAddress : meta.id)
      ?.filter((farm) => farm.depositId === depositData.depositId) ?? []

  const { total, maxTotal, claimableAssetValues } =
    useSummarizeClaimableValues(poolClaimableValues)

  const claimableAssets = Object.keys(claimableAssetValues ?? {}).map((key) => {
    const asset = getAssetWithFallback(key)
    return {
      value: claimableAssetValues[key],
      symbol: asset.symbol,
      id: asset.id,
    }
  })

  const totalRewardsValue = claimableAssets
    .map((claimableAsset) =>
      t("value.tokenWithSymbol", {
        value: claimableAsset.value.rewards,
        symbol: claimableAsset.symbol,
      }),
    )
    .join(" + ")

  const maxTotalRewardsValue = claimableAssets
    .map((claimableAsset) =>
      t("value.tokenWithSymbol", {
        value: BigNumber(claimableAsset.value.maxRewards),
        symbol: claimableAsset.symbol,
      }),
    )
    .join(" + ")

  // use latest entry date
  const enteredDate = useEnteredDate(
    depositNft.data.yieldFarmEntries.reduce(
      (acc, curr) => (acc.lt(curr.enteredAt) ? BigNumber(curr.enteredAt) : acc),
      BN_0,
    ),
  )

  return (
    <>
      <div
        sx={{
          flex: ["column", "row"],
          gap: [6, 0],
          justify: "space-between",
          align: ["stretch", "center"],
        }}
      >
        <Text fw={[500, 400]}>
          {t("farms.positions.position.title", { index })}
        </Text>
        <div sx={{ flex: "row", gap: 8 }}>
          <ExitFarmsButton depositNft={depositNft} />
          <FarmingPositionDetailsButton
            depositNft={depositNft}
            depositData={depositData}
          />
        </div>
      </div>

      <div sx={{ flex: "column", gap: 8 }}>
        <Text fs={14} color="basic500">
          {t("farms.positions.claimableRewards")}
        </Text>
        <div sx={{ flex: ["column", "row"], gap: 8 }}>
          {poolClaimableValues.map((poolClaimableValue, index) => {
            const percentage = BigNumber(
              poolClaimableValue.loyaltyFactor,
            ).times(100)

            return (
              <div
                key={`${poolClaimableValue.yieldFarmId}_${index}`}
                sx={{ flex: "row", gap: 8, align: "center", flexGrow: 1 }}
              >
                <Icon
                  size={20}
                  icon={<AssetLogo id={poolClaimableValue.rewardCurrency} />}
                />
                <LinearProgress
                  size="small"
                  color="brightBlue300"
                  withoutLabel
                  percent={percentage.toNumber()}
                  css={{ flexGrow: 1, width: "100%" }}
                />
                <Text fs={11} color="darkBlue200">
                  {t("value.percentage", { value: percentage })}
                </Text>
                {index < claimableAssets.length - 1 && (
                  <Separator
                    orientation="vertical"
                    sx={{
                      display: ["none", "inherit"],
                      height: "100%",
                      color: "white",
                    }}
                    opacity={0.6}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <SSeparator sx={{ mx: "auto", display: ["none", "inherit"] }} />

      <div
        sx={{
          flex: "column",
          gap: 10,
          py: 10,
        }}
      >
        <SValueContainer>
          <Text color="basic500" fs={14} lh={16}>
            {t("farms.positions.labels.apr")}
          </Text>
          <JoinedFarms depositNft={depositNft} />
        </SValueContainer>
        <SSeparator />

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
            {t("farms.positions.labels.totalRewards")}
          </Text>
          <div sx={{ flex: "column", align: "flex-end" }}>
            {isDesktop && <Text fs={14}>{maxTotalRewardsValue}</Text>}
            <div sx={{ flex: "row", gap: 4 }}>
              <DollarAssetValue
                value={BigNumber(maxTotal)}
                wrapper={(children) => (
                  <Text
                    fs={[14, 11]}
                    lh={[14, 12]}
                    color={["basic100", "whiteish500"]}
                  >
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BigNumber(maxTotal)} />
              </DollarAssetValue>
              {!isDesktop && <InfoTooltip text={maxTotalRewardsValue} />}
            </div>
          </div>
        </SValueContainer>
        <SSeparator />
        <SValueContainer>
          <Text color="basic500" fs={14} lh={16}>
            {t("farms.positions.labels.claimableRewards")}
          </Text>
          <div sx={{ flex: "column", align: "flex-end" }}>
            {isDesktop && <Text fs={14}>{totalRewardsValue}</Text>}
            <div sx={{ flex: "row", gap: 4 }}>
              <DollarAssetValue
                value={BigNumber(total)}
                wrapper={(children) => (
                  <Text
                    fs={[14, 11]}
                    lh={[14, 12]}
                    color={["basic100", "whiteish500"]}
                  >
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BigNumber(total)} />
              </DollarAssetValue>
              {!isDesktop && <InfoTooltip text={totalRewardsValue} />}
            </div>
          </div>
        </SValueContainer>
        <SSeparator />
        {isXYKDeposit(depositData) ? (
          <XYKFields depositData={depositData} />
        ) : (
          <OmnipoolFields depositData={depositData} />
        )}
      </div>

      {availableYieldFarms.length ? (
        <RedepositFarms
          depositNft={depositNft}
          availableYieldFarms={availableYieldFarms}
          depositData={depositData}
        />
      ) : null}
    </>
  )
}

const OmnipoolFields = ({ depositData }: { depositData: TOmniDepositData }) => {
  const { t } = useTranslation()

  const { meta, amountShifted, amountDisplay, valueShifted, lrnaShifted } =
    depositData ?? {}

  return (
    <>
      <SValueContainer>
        <Text color="basic500" fs={14} lh={16}>
          {t("farms.positions.labels.initialValue")}
        </Text>
        <div sx={{ flex: "column", align: "flex-end" }}>
          <Text fs={14}>
            {t("value.tokenWithSymbol", {
              value: amountShifted,
              symbol: meta?.symbol,
            })}
          </Text>
          <Text fs={11} css={{ color: "rgba(221, 229, 255, 0.61)" }}>
            <DisplayValue value={amountDisplay} />
          </Text>
        </div>
      </SValueContainer>
      <SSeparator />
      <SValueContainer>
        <div sx={{ flex: "row", gap: 4 }}>
          <Text color="basic500" fs={14} lh={16}>
            {t("farms.positions.labels.currentValue")}
          </Text>
          <LrnaPositionTooltip
            assetId={meta?.id}
            tokenPosition={valueShifted}
            lrnaPosition={lrnaShifted}
          />
        </div>

        <div sx={{ flex: "column", align: "flex-end" }}>
          <Text fs={14}>
            {t("value.tokenWithSymbol", {
              value: depositData.totalValueShifted,
              symbol: meta?.symbol,
            })}
          </Text>
          <DollarAssetValue
            value={depositData.valueDisplay}
            wrapper={(children) => (
              <Text fs={11} lh={12} color="whiteish500">
                {children}
              </Text>
            )}
          >
            <DisplayValue value={depositData.valueDisplay} />
          </DollarAssetValue>
        </div>
      </SValueContainer>
    </>
  )
}

const XYKFields = ({ depositData }: { depositData: TXYKDepositData }) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { amountUSD, assetA, assetB } = depositData

  const value =
    t("value.tokenWithSymbol", {
      value: assetA.amount,
      symbol: assetA.symbol,
    }) +
    " | " +
    t("value.tokenWithSymbol", {
      value: assetB.amount,
      symbol: assetB.symbol,
    })

  return (
    <SValueContainer>
      <Text color="basic500" fs={14} lh={16}>
        {t("farms.positions.labels.currentValue")}
      </Text>
      <div sx={{ flex: "column", align: "flex-end" }}>
        {isDesktop && <Text fs={14}>{value}</Text>}
        <div sx={{ flex: "row", gap: 4 }}>
          <DollarAssetValue
            value={amountUSD}
            wrapper={(children) => (
              <Text
                fs={[14, 11]}
                lh={[14, 12]}
                color={["basic100", "whiteish500"]}
              >
                {children}
              </Text>
            )}
          >
            <DisplayValue value={amountUSD} />
          </DollarAssetValue>
          {!isDesktop && <InfoTooltip text={value} />}
        </div>
      </div>
    </SValueContainer>
  )
}
