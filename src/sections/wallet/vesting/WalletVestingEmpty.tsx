import { ReactComponent as VestingIcon } from "assets/icons/PositionsIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"

export const WalletVestingEmpty = () => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        mt: 80,
        mb: 54,
        textAlign: "center",
      }}
    >
      <VestingIcon
        sx={{
          color: "neutralGray500",
          width: 59,
          height: 59,
        }}
      />
      <Text
        color="neutralGray500"
        tAlign="center"
        lh={22}
        sx={{
          mt: 22,
        }}
      >
        <Trans t={t} i18nKey="wallet.vesting.empty" />
      </Text>
    </div>
  )
}
