import { ExtrinsicStatus } from "@polkadot/types/interfaces/author"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ReviewTransactionProgress } from "./ReviewTransactionProgress"

type Props = {
  onClose: () => void
  txState: ExtrinsicStatus["type"] | null
}

export const ReviewTransactionPending = ({ onClose, txState }: Props) => {
  const { t } = useTranslation()
  return (
    <div
      sx={{
        flex: "column",
        align: "center",
        pt: [200, 50],
        minHeight: "100%",
        width: "100%",
      }}
    >
      <Spinner css={{ width: 135, height: 135 }} />
      <Heading fs={19} fw={500} tAlign="center" sx={{ mt: 20 }}>
        {t("liquidity.reviewTransaction.modal.pending.title")}
      </Heading>
      <div sx={{ px: 20, mt: 20, mb: [0, 40] }}>
        <Text tAlign="center" fs={16} color="basic400" fw={400} lh={22}>
          {t("liquidity.reviewTransaction.modal.pending.description")}
        </Text>
      </div>
      <Button
        variant="primary"
        sx={{ mt: 40, width: [200, "auto"] }}
        onClick={onClose}
      >
        {t("liquidity.reviewTransaction.modal.success.close")}
      </Button>

      <Spacer size={40} />

      {txState === "Broadcast" && (
        <ReviewTransactionProgress duration={3} onComplete={onClose} />
      )}
    </div>
  )
}
