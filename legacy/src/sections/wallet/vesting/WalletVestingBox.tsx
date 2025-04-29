import { SBox } from "./WalletVestingBox.styled"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WalletVestingSchedule } from "./WalletVestingSchedule"
import { WalletVestingEmpty } from "./WalletVestingEmpty"
import { useVestingSchedules } from "api/vesting"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isApiLoaded } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { Spinner } from "components/Spinner/Spinner"

const VestingBoxContent = () => {
  const { account } = useAccount()
  const { data, isInitialLoading } = useVestingSchedules(account?.address)

  if (isInitialLoading) {
    return (
      <div
        sx={{ flex: "row", align: "center", justify: "center", height: 240 }}
      >
        <Spinner size={50} />
      </div>
    )
  }

  if (data) {
    return !!data.length ? <WalletVestingSchedule /> : <WalletVestingEmpty />
  }

  return <WalletVestingEmpty />
}

export const WalletVestingBox = () => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()

  return (
    <div sx={{ flex: "column", flexGrow: 1 }}>
      <SBox>
        <Heading
          fs={[15, 19]}
          fw={500}
          sx={{
            ml: 10,
          }}
        >
          {t("wallet.vesting.your_vesting")}
        </Heading>
        {isApiLoaded(api) ? <VestingBoxContent /> : <WalletVestingEmpty />}
      </SBox>
    </div>
  )
}
