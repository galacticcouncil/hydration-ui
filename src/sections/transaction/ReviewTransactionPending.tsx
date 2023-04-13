import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import { ReviewTransactionProgress } from "./ReviewTransactionProgress"
import { Heading } from "components/Typography/Heading/Heading"
import { ExtrinsicStatus } from "@polkadot/types/interfaces/author"

type Props = {
  onClose: () => void
  txState: ExtrinsicStatus["type"] | null
  withoutClose: boolean
}

export const ReviewTransactionPending = ({
  onClose,
  txState,
  withoutClose,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        flex: "column",
        align: "center",
        justify: "center",
        flexGrow: 1,
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
      {!withoutClose && (
        <Button
          variant="primary"
          sx={{ my: 40, width: [200, "auto"] }}
          onClick={onClose}
        >
          {t("liquidity.reviewTransaction.modal.success.close")}
        </Button>
      )}

      {!withoutClose && txState === "Broadcast" && (
        <ReviewTransactionProgress duration={3} onComplete={onClose} />
      )}
    </div>
  )
}
