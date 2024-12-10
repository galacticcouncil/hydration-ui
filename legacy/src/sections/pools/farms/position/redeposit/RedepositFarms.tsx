import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { useState } from "react"
import { Farm } from "api/farms"
import {
  isXYKDeposit,
  TDepositData,
} from "sections/pools/farms/position/FarmingPosition.utils"
import { omit } from "utils/rx"
import { TDeposit } from "api/deposits"

type RedepositFarmsProps = {
  depositNft: TDeposit
  availableYieldFarms: Farm[]
  depositData: TDepositData
}

export const RedepositFarms = ({
  depositNft,
  availableYieldFarms,
  depositData,
}: RedepositFarmsProps) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)

  if (!availableYieldFarms.length) return null

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 4 }}>
        <Text fs={13} color="brightBlue300" tTransform="uppercase">
          <Trans t={t} i18nKey="farms.positions.redeposit.openFarms" />
        </Text>

        <GlobalFarmRowMulti
          farms={availableYieldFarms}
          fontSize={16}
          iconSize={24}
          css={{ flexDirection: "row-reverse" }}
        />
      </div>

      <SJoinButton
        onClick={() => setJoinFarm(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <Text fs={12} color="basic900" tTransform="uppercase" tAlign="center">
          {t("farms.positions.join.button.label")}
        </Text>
      </SJoinButton>
      {joinFarm && (
        <JoinFarmModal
          farms={availableYieldFarms}
          position={
            !isXYKDeposit(depositData)
              ? omit(["depositId"], depositData)
              : undefined
          }
          onClose={() => setJoinFarm(false)}
          depositNft={depositNft}
        />
      )}
    </SContainer>
  )
}