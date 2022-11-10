import { SBox } from "./WalletVestingBox.styled"
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
    <SBox>
      <Heading
        fs={20}
        fw={500}
        sx={{
          ml: 10,
        }}
      >
        {t("wallet.vesting.your_vesting")}
      </Heading>
      {renderContent()}
    </SBox>
  )
}
