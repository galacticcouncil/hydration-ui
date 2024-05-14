import { Text } from "components/Typography/Text/Text"
import { SContainer, SJoinButton } from "./RedepositFarms.styled"
import { Trans, useTranslation } from "react-i18next"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { useState } from "react"
import { useFarms } from "api/farms"
import { useFarmRedepositMutation } from "utils/farms/redeposit"

type RedepositFarmsProps = {
  depositNft: TMiningNftPosition
  poolId: string
}

export const RedepositFarms = ({ depositNft, poolId }: RedepositFarmsProps) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)

  const farms = useFarms([poolId])

  let availableYieldFarms =
    farms.data?.filter(
      (i) =>
        !depositNft.data.yieldFarmEntries.some(
          (entry) =>
            entry.globalFarmId.eq(i.globalFarm.id) &&
            entry.yieldFarmId.eq(i.yieldFarm.id),
        ),
    ) ?? []

  const redeposit = useFarmRedepositMutation(
    availableYieldFarms,
    depositNft,
    poolId,
    () => setJoinFarm(false),
  )

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
          poolId={poolId}
          initialShares={depositNft.data.shares.toBigNumber()}
          onClose={() => setJoinFarm(false)}
          isRedeposit
          mutation={redeposit}
        />
      )}
    </SContainer>
  )
}
