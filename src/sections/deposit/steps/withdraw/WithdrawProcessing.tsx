import { Spinner } from "components/Spinner/Spinner"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export type WithdrawProcessingProps = {
  className?: string
}

export const WithdrawProcessing: React.FC<WithdrawProcessingProps> = ({
  className,
}) => {
  const { t } = useTranslation()
  return (
    <div
      className={className}
      sx={{
        flex: "column",
        align: "center",
        justify: "center",
        bg: "darkBlue700",
      }}
    >
      <Spinner size={80} />
      <Text tAlign="center" fs={20} sx={{ mt: 20 }}>
        {t("withdraw.transfer.withdrawing.title")}
      </Text>
      <Text
        tAlign="center"
        fs={14}
        lh={20}
        color="basic400"
        sx={{ width: ["100%", "75%"], mt: 10 }}
      >
        {t("withdraw.transfer.withdrawing.description")}
      </Text>
    </div>
  )
}
