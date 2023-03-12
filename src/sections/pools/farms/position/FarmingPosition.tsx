import {
  SContainer,
  SSeparator,
  SValueContainer,
} from "./FarmingPosition.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import { theme } from "theme"
import { RedepositFarms } from "./redeposit/RedepositFarms"
import { JoinedFarms } from "./joined/JoinedFarms"
import { useMedia } from "react-use"
import { useState } from "react"
import { JoinedFarmsDetails } from "../modals/joinedFarmDetails/JoinedFarmsDetails"
import { useEnteredDate } from "utils/block"
import { BN_0 } from "utils/constants"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { DepositNftType } from "api/deposits"
import { useAssetMeta } from "api/assetMeta"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { useDepositShare } from "./FarmingPosition.utils"

function FarmingPositionDetailsButton(props: {
  pool: OmnipoolPool
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
          pool={props.pool}
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
  pool,
  depositNft,
}: {
  index: number
  pool: OmnipoolPool
  depositNft: DepositNftType
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const meta = useAssetMeta(pool.id)

  const position = useDepositShare(pool.id, [depositNft.id.toString()])
    .data?.[0]

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
        <FarmingPositionDetailsButton pool={pool} depositNft={depositNft} />
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
              {t("farms.positions.labels.lockedShares")}
            </Text>
            <Text>
              {t("value", {
                value: depositNft.deposit.shares,
                fixedPointScale: meta.data?.decimals ?? 12,
                type: "token",
              })}
            </Text>
          </SValueContainer>
          <SSeparator orientation={isDesktop ? "vertical" : "horizontal"} />
          <SValueContainer sx={{ width: ["100%", 150] }}>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.currentValue")}
            </Text>
            {position && (
              <div>
                <WalletAssetsHydraPositionsData
                  symbol={position.symbol}
                  value={position.value}
                  lrna={position.lrna}
                />
                <DollarAssetValue
                  value={position.valueUSD}
                  wrapper={(children) => (
                    <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                      {children}
                    </Text>
                  )}
                >
                  {t("value.usd", { amount: position.valueUSD })}
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
        <JoinedFarms poolId={pool.id} depositNft={depositNft} />
        <RedepositFarms pool={pool} depositNft={depositNft} />
      </div>
    </SContainer>
  )
}
