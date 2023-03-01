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
            <Text>{t("value", { value: depositNft.deposit.shares })}</Text>
          </SValueContainer>
          <SSeparator orientation={isDesktop ? "vertical" : "horizontal"} />
          <SValueContainer sx={{ width: ["100%", 150] }}>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.currentValue")}
            </Text>
            <div>
              <Text>0.333 BTC</Text>
              <Text
                fs={11}
                lh={15}
                css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
              >
                2 3334$
              </Text>
            </div>
          </SValueContainer>
        </div>
      </div>
      <SSeparator sx={{ display: ["none", "inherit"] }} />
      <div
        sx={{ flex: ["column", "row"], justify: "space-between", pt: [0, 10] }}
      >
        <JoinedFarms />
        <RedepositFarms />
      </div>
    </SContainer>
  )
}
