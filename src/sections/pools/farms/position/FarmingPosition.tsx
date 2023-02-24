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
import BN from "bignumber.js"

const dummyData = {
  joinedFarms: [
    {
      depositNft: { deposit: { shares: BN(67788889389433788) } },
      farm: {
        assetId: "1",
        distributedRewards: BN(67788889389433788),
        maxRewards: BN(234455677889856658),
        fullness: BN(0.5),
        minApr: BN(0.5),
        apr: BN(0.9),
      },
    },
    {
      depositNft: { deposit: { shares: BN(677888838943388) } },
      farm: {
        assetId: "0",
        distributedRewards: BN(2345231478222228),
        maxRewards: BN(11123445522222888),
        fullness: BN(0.3),
        minApr: BN(0.5),
        apr: BN(0.9),
      },
    },
  ],
  availableFarms: [
    {
      depositNft: undefined,
      farm: {
        assetId: "2",
        distributedRewards: BN(2345231478222228),
        maxRewards: BN(11123445522222888),
        fullness: BN(0.3),
        minApr: BN(0.5),
        apr: BN(0.9),
      },
    },
  ],
}
export const FarmingPosition = ({ index }: { index: number }) => {
  const { t } = useTranslation()

  const [farmDetails, setFarmDetails] = useState(false)

  const isDesktop = useMedia(theme.viewport.gte.sm)

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
        <Button
          size="small"
          sx={{ ml: 14 }}
          onClick={() => setFarmDetails(true)}
        >
          {t("farms.positions.joinedFarms.button.label")}
        </Button>
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
            <Text>2.02.2022</Text>
          </SValueContainer>
          <SSeparator orientation={isDesktop ? "vertical" : "horizontal"} />
          <SValueContainer>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.lockedShares")}
            </Text>
            <Text>2 855.222</Text>
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
      {farmDetails && (
        <JoinedFarmsDetails
          joinedFarms={dummyData.joinedFarms}
          availableFarms={dummyData.availableFarms}
          isOpen={farmDetails}
          onClose={() => setFarmDetails(false)}
        />
      )}
    </SContainer>
  )
}
