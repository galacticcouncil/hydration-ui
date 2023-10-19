import { DepositNftType } from "api/deposits"
import { Button } from "components/Button/Button"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { theme } from "theme"
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
import { u32 } from "@polkadot/types-codec"

function FarmingPositionDetailsButton(props: {
  poolId: u32
  depositNft: DepositNftType
}) {
  const { t } = useTranslation()
  const [farmDetails, setFarmDetails] = useState(false)

  return (
    <>
      <Button size="small" sx={{ ml: 14 }} onClick={() => setFarmDetails(true)}>
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

export const FarmingPosition = ({
  index,
  poolId,
  depositNft,
}: {
  index: number
  poolId: u32
  depositNft: DepositNftType
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const isDesktop = useMedia(theme.viewport.gte.sm)
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
    depositNft.deposit.yieldFarmEntries.reduce(
      (acc, curr) =>
        acc.lt(curr.enteredAt.toBigNumber())
          ? curr.enteredAt.toBigNumber()
          : acc,
      BN_0,
    ),
  )

  return (
    <SContainer>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          py: [0, 10],
        }}
      >
        <Text fw={[500, 400]}>
          {t("farms.positions.position.title", { index })}
        </Text>
        <FarmingPositionDetailsButton poolId={poolId} depositNft={depositNft} />
      </div>
      <SSeparator />
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          gap: 40,
          py: [0, 10],
        }}
      >
        <div
          sx={{
            flex: ["column", "row"],
            justify: "space-between",
            flexGrow: 1,
          }}
        >
          <SValueContainer sx={{ pt: 0 }}>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.enterDate")}
            </Text>
            <Text>
              {t("farms.positions.labels.enterDate.value", {
                date: enteredDate.data,
              })}
            </Text>
          </SValueContainer>
          <SSeparator orientation={isDesktop ? "vertical" : "horizontal"} />
          <SValueContainer>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.initialValue")}
            </Text>
            <div>
              <Text>
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
          <SSeparator orientation={isDesktop ? "vertical" : "horizontal"} />
          <SValueContainer sx={{ width: ["100%", 250] }}>
            <div sx={{ flex: "row", gap: 6, align: "center" }}>
              <Text color="basic500" fs={14} lh={16} fw={400}>
                {t("farms.positions.labels.currentValue")}
              </Text>
              <LrnaPositionTooltip
                assetId={position.data?.assetId}
                tokenPosition={position.data?.value}
                lrnaPosition={position.data?.lrna}
              />
            </div>

            {position.data && (
              <div>
                <WalletAssetsHydraPositionsData
                  symbol={position.data.symbol}
                  value={position.data.value}
                  lrna={position.data.lrna}
                />
                <DollarAssetValue
                  value={position.data.valueDisplay}
                  wrapper={(children) => (
                    <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
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
      </div>
      <SSeparator sx={{ display: ["none", "inherit"] }} />
      <div
        sx={{ flex: ["column", "row"], justify: "space-between", pt: [0, 10] }}
      >
        <JoinedFarms poolId={poolId} depositNft={depositNft} />
        <RedepositFarms poolId={poolId} depositNft={depositNft} />
      </div>
    </SContainer>
  )
}
