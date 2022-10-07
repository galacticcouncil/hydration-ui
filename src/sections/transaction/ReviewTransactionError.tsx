import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { ReactComponent as FailIcon } from "assets/icons/FailIcon.svg"
import { css } from "@emotion/react"
import { useTranslation } from "react-i18next"
import { SButtons } from "./ReviewTransactionError.styled"

export const ReviewTransactionError = (props: {
  onClose: () => void
  onReview: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", align: "center" }}>
      <FailIcon />
      <Text color="red400" fs={24} fw={600} tAlign="center" sx={{ mt: 20 }}>
        {t("pools.reviewTransaction.modal.error.title")}
      </Text>
      <div sx={{ flex: "column", align: "center", px: 20, mt: 20, mb: 40 }}>
        <Text tAlign="center" fs={16} color="neutralGray200" fw={400} lh={22}>
          {t("pools.reviewTransaction.modal.error.description")}
        </Text>

        <SButtons>
          <Button
            type="button"
            variant="secondary"
            sx={{ mt: 40 }}
            onClick={props.onClose}
            css={css`
              width: 100%;
              text-align: center;
              flex-grow: 1;
            `}
          >
            {t("pools.reviewTransaction.modal.error.close")}
          </Button>

          <Button
            type="button"
            variant="transparent"
            size="small"
            sx={{ mt: 10 }}
            onClick={props.onReview}
          >
            {t("pools.reviewTransaction.modal.error.review")}
          </Button>
        </SButtons>
      </div>
    </div>
  )
}
