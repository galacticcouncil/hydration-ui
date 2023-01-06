import { SBox, SMobBackground } from "./WalletVestingBox.styled"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WalletVestingSchedule } from "./WalletVestingSchedule"
import { WalletVestingEmpty } from "./WalletVestingEmpty"
import { useVestingSchedules } from "../../../api/vesting"
import { useAccountStore } from "../../../state/store"

export const WalletVestingBox = () => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const { data, isLoading } = useVestingSchedules(account?.address)

  const renderContent = () => {
    if (isLoading) {
      return null
    }

    if (data) {
      return !!data.length ? <WalletVestingSchedule /> : <WalletVestingEmpty />
    }

    return null
  }

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
        {renderContent()}
      </SBox>
      <SMobBackground />
    </div>
  )
}
